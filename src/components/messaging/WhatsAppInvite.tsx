import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { X, Phone, UserPlus, Send } from 'lucide-react';

interface WhatsAppInviteProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function WhatsAppInvite({ onClose, onSuccess }: WhatsAppInviteProps) {
  const { user } = useAuth();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const searchByWhatsApp = async () => {
    if (!whatsappNumber.trim()) {
      alert('Please enter a WhatsApp number');
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role, avatar_url, whatsapp_number')
        .eq('whatsapp_number', whatsappNumber.trim())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFoundUser(data);
      } else {
        alert('No user found with this WhatsApp number. They may not be on PawMatch yet.');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      alert('Failed to search. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const startConversation = async () => {
    if (!foundUser) return;

    setCreating(true);
    try {
      const { data: existingConv, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(participant_1.eq.${user?.id},participant_2.eq.${foundUser.id}),and(participant_1.eq.${foundUser.id},participant_2.eq.${user?.id})`
        )
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingConv) {
        alert('You already have a conversation with this user!');
        onSuccess();
        onClose();
        return;
      }

      const { error: createError } = await supabase.from('conversations').insert({
        participant_1: user?.id,
        participant_2: foundUser.id,
        last_message_at: new Date().toISOString(),
      });

      if (createError) throw createError;

      alert(`Started conversation with ${foundUser.name}!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const inviteViaWhatsApp = () => {
    const message = encodeURIComponent(
      `Hey! I'm using PawMatch to connect with pet breeders and seekers in Malta. Join me: https://pawmatch.mt`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Find by WhatsApp</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+356XXXXXXXX"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={searchByWhatsApp}
                disabled={searching}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Include country code (e.g., +356 for Malta)
            </p>
          </div>

          {foundUser && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-3 mb-4">
                {foundUser.avatar_url ? (
                  <img
                    src={foundUser.avatar_url}
                    alt={foundUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">{foundUser.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {foundUser.role.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <button
                onClick={startConversation}
                disabled={creating}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {creating ? 'Creating...' : 'Start Conversation'}
              </button>
            </div>
          )}

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3">
              Not on PawMatch yet? Invite them via WhatsApp:
            </p>
            <button
              onClick={inviteViaWhatsApp}
              disabled={!whatsappNumber.trim()}
              className="w-full border-2 border-green-500 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Send Invite via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
