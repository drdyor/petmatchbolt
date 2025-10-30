import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { MessageCircle, Send, Video, PhoneCall, ArrowLeft, User } from 'lucide-react';
import { formatDateTime } from '@/lib/heatCycleUtils';
import { MESSAGE_TYPES } from '@/lib/constants';

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  other_user: {
    name: string;
    role: string;
    avatar_url: string | null;
    whatsapp_number: string | null;
  };
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  media_url: string | null;
  metadata: any;
  read: boolean;
  created_at: string;
}

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      markMessagesAsRead(selectedConversation);
      subscribeToMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages(id, read, sender_id)
        `)
        .or(`participant_1.eq.${user?.id},participant_2.eq.${user?.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const conversationsWithUsers = await Promise.all(
        data.map(async (conv) => {
          const otherUserId = conv.participant_1 === user?.id ? conv.participant_2 : conv.participant_1;
          const { data: userData } = await supabase
            .from('users')
            .select('name, role, avatar_url, whatsapp_number')
            .eq('id', otherUserId)
            .maybeSingle();

          const unreadCount = conv.messages?.filter(
            (m: any) => !m.read && m.sender_id !== user?.id
          ).length || 0;

          return {
            ...conv,
            other_user: userData || { name: 'Unknown User', role: '', avatar_url: null, whatsapp_number: null },
            unread_count: unreadCount,
          };
        })
      );

      setConversations(conversationsWithUsers);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user?.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation,
        sender_id: user?.id,
        content: newMessage,
        message_type: MESSAGE_TYPES.TEXT,
      });

      if (error) throw error;

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleVideoCallRequest = async () => {
    if (!selectedConversation) return;

    const scheduledTime = new Date();
    scheduledTime.setMinutes(scheduledTime.getMinutes() + 5);

    try {
      const { error: callError } = await supabase.from('video_calls').insert({
        conversation_id: selectedConversation,
        scheduled_time: scheduledTime.toISOString(),
        platform: 'whatsapp',
        status: 'scheduled',
        created_by: user?.id,
      });

      if (callError) throw callError;

      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: selectedConversation,
        sender_id: user?.id,
        content: 'Video call request',
        message_type: MESSAGE_TYPES.VIDEO_CALL_INVITE,
        metadata: { platform: 'whatsapp', scheduled_time: scheduledTime.toISOString() },
      });

      if (msgError) throw msgError;
    } catch (error) {
      console.error('Error requesting video call:', error);
    }
  };

  const openWhatsApp = (phoneNumber: string) => {
    const message = encodeURIComponent('Hi, I would like to schedule a video call about your listing.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const selectedConvData = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-80 bg-white border-r`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 border-b hover:bg-gray-50 text-left ${
                  selectedConversation === conv.id ? 'bg-orange-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.other_user.avatar_url ? (
                      <img src={conv.other_user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate">{conv.other_user.name}</h3>
                      {conv.unread_count > 0 && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 capitalize">{conv.other_user.role.replace('_', ' ')}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={`${selectedConversation ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
        {selectedConversation && selectedConvData ? (
          <>
            <div className="p-4 bg-white border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {selectedConvData.other_user.avatar_url ? (
                    <img
                      src={selectedConvData.other_user.avatar_url}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedConvData.other_user.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">
                    {selectedConvData.other_user.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedConvData.other_user.whatsapp_number && (
                  <button
                    onClick={() => openWhatsApp(selectedConvData.other_user.whatsapp_number!)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Video call via WhatsApp"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={handleVideoCallRequest}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Request video call"
                >
                  <PhoneCall className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isSender = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                    {msg.message_type === MESSAGE_TYPES.VIDEO_CALL_INVITE ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm">
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                          <Video className="w-5 h-5" />
                          <span className="font-semibold">Video Call Invitation</span>
                        </div>
                        <p className="text-sm text-blue-600 mb-3">
                          {isSender ? 'You requested a video call' : 'Requested a video call with you'}
                        </p>
                        {msg.metadata?.platform === 'whatsapp' && !isSender && (
                          <button
                            onClick={() => selectedConvData.other_user.whatsapp_number && openWhatsApp(selectedConvData.other_user.whatsapp_number)}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Join via WhatsApp
                          </button>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`max-w-sm px-4 py-2 rounded-lg ${
                          isSender ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isSender ? 'text-orange-100' : 'text-gray-500'}`}>
                          {formatDateTime(msg.created_at)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-white border-t">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
