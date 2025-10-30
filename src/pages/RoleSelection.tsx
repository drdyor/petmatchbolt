import { useNavigate } from 'react-router-dom';
import { Dog, Home, Stethoscope, Users } from 'lucide-react';

const roles = [
  {
    id: 'breeder',
    title: 'Breeder',
    description: 'Register and showcase your pets',
    icon: Dog,
    color: 'bg-blue-500',
  },
  {
    id: 'shelter',
    title: 'Shelter',
    description: 'Manage adoptions and rescues',
    icon: Home,
    color: 'bg-green-500',
  },
  {
    id: 'buyer',
    title: 'Pet Seeker',
    description: 'Find your perfect companion',
    icon: Users,
    color: 'bg-purple-500',
  },
  {
    id: 'vet',
    title: 'Veterinarian',
    description: 'Manage patient records',
    icon: Stethoscope,
    color: 'bg-red-500',
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (roleId: string) => {
    navigate('/home', { state: { role: roleId } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Choose Your Role</h1>
        <p className="text-center text-gray-600 mb-12">Select how you'd like to use PawMatch</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left"
            >
              <div className={`${role.color} w-16 h-16 rounded-full flex items-center justify-center mb-4`}>
                <role.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{role.title}</h3>
              <p className="text-gray-600">{role.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
