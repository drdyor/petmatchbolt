import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, Plus, Stethoscope, Syringe, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import { formatDateTime } from '@/lib/heatCycleUtils';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_type: string;
  status: string;
  notes: string;
  pet: {
    name: string;
    breed: string;
    species: string;
  };
  breeder: {
    name: string;
    phone: string;
  };
}

interface Vaccination {
  id: string;
  vaccine_name: string;
  date_administered: string;
  next_due_date: string;
  pet: {
    name: string;
    breed: string;
  };
  breeder: {
    name: string;
  };
}

export default function VetDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    registeredBreeders: 0,
    upcomingVaccinations: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      // Load appointments
      const { data: apptData, error: apptError } = await supabase
        .from('vet_appointments')
        .select(`
          *,
          pet:pets(name, breed, species),
          breeder:users!vet_appointments_breeder_id_fkey(name, phone)
        `)
        .eq('vet_user_id', user?.id)
        .gte('appointment_date', today.toISOString())
        .order('appointment_date', { ascending: true });

      if (apptError) throw apptError;
      setAppointments(apptData || []);

      // Load vaccinations due soon
      const { data: vacData, error: vacError } = await supabase
        .from('vaccinations')
        .select(`
          *,
          pet:pets(name, breed),
          breeder:users!vaccinations_breeder_id_fkey(name)
        `)
        .eq('vet_user_id', user?.id)
        .gte('next_due_date', today.toISOString())
        .lte('next_due_date', weekFromNow.toISOString())
        .order('next_due_date', { ascending: true });

      if (vacError) throw vacError;
      setUpcomingVaccinations(vacData || []);

      // Load registered breeders
      const { data: breederData } = await supabase
        .from('breeder_vet_relationships')
        .select('breeder_id')
        .eq('vet_user_id', user?.id);

      // Calculate stats
      const todayAppts = apptData?.filter(a => {
        const apptDate = new Date(a.appointment_date);
        return apptDate >= today && apptDate < tomorrow;
      }).length || 0;

      const weekAppts = apptData?.filter(a => {
        const apptDate = new Date(a.appointment_date);
        return apptDate >= today && apptDate < weekFromNow;
      }).length || 0;

      setStats({
        todayAppointments: todayAppts,
        weekAppointments: weekAppts,
        registeredBreeders: breederData?.length || 0,
        upcomingVaccinations: vacData?.length || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendVaccinationReminder = async (vaccination: any) => {
    try {
      // Get breeder_id from the vaccination record
      const { data: vacData } = await supabase
        .from('vaccinations')
        .select('breeder_id')
        .eq('id', vaccination.id)
        .single();

      if (!vacData) return;

      const { error } = await supabase.from('notifications').insert({
        user_id: vacData.breeder_id,
        type: 'vaccination',
        title: 'Vaccination Due Soon',
        message: `${vaccination.pet.name} is due for ${vaccination.vaccine_name} vaccination on ${formatDateTime(vaccination.next_due_date)}`,
        read: false,
      });

      if (error) throw error;
      alert('Reminder sent to breeder!');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole="vet" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Veterinary Dashboard</h1>
              <p className="text-gray-600">Manage appointments and patient records</p>
            </div>
            <button
              onClick={() => alert('Add appointment modal coming soon')}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              New Appointment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Today</h3>
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.todayAppointments}</p>
              <p className="text-xs text-gray-500 mt-1">Appointments</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">This Week</h3>
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.weekAppointments}</p>
              <p className="text-xs text-gray-500 mt-1">Scheduled</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Breeders</h3>
                <Users className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.registeredBreeders}</p>
              <p className="text-xs text-gray-500 mt-1">Registered</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Vaccines Due</h3>
                <Syringe className="w-5 h-5 text-pink-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.upcomingVaccinations}</p>
              <p className="text-xs text-gray-500 mt-1">Next 7 days</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        appointment.appointment_type === 'vaccination' ? 'bg-pink-100' :
                        appointment.appointment_type === 'surgery' ? 'bg-red-100' :
                        appointment.appointment_type === 'emergency' ? 'bg-orange-100' :
                        'bg-blue-100'
                      }`}>
                        {appointment.appointment_type === 'vaccination' ? (
                          <Syringe className="w-6 h-6 text-pink-600" />
                        ) : (
                          <Stethoscope className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-semibold text-gray-900">{appointment.pet?.name}</h3>
                            <p className="text-sm text-gray-600">{appointment.pet?.breed}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Owner: {appointment.breeder?.name}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateTime(appointment.appointment_date)}
                          </span>
                          <span className="capitalize">{appointment.appointment_type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Vaccination Reminders</h2>
            </div>
            <div className="p-6">
              {upcomingVaccinations.length === 0 ? (
                <div className="text-center py-8">
                  <Syringe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No vaccinations due soon</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingVaccinations.map((vaccination) => (
                    <div key={vaccination.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {vaccination.pet?.name} - {vaccination.vaccine_name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Owner: {vaccination.breeder?.name}
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            Due: {formatDateTime(vaccination.next_due_date)}
                          </p>
                          <button
                            onClick={() => sendVaccinationReminder(vaccination)}
                            className="text-sm px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                          >
                            Send Reminder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-left">
                View Patient Records
              </button>
              <button className="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-left">
                Add Vaccination Record
              </button>
              <button className="w-full px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors font-medium text-left">
                Send Bulk Reminders
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 md:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No recent activity to display</span>
              </div>
              <p className="text-gray-500 text-xs">
                Activity from appointments and vaccinations will appear here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
