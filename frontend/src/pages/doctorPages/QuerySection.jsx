import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { 
  Smile, 
  Paperclip, 
  Send, 
  Image as ImageIcon,
  Video,
  FileText,
  Mic,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Edit2,
  Trash2,
  Filter,
  Search,
  Bot,
  ThumbsUp,
  AlertCircle
} from "lucide-react";

// Emoji picker component
const EmojiPicker = ({ onSelect }) => {
  const emojis = ['😀', '😂', '😊', '🥰', '😎', '🤔', '😢', '😡', '👍', '❤️', '🔥', '🎉', '💯', '🙏', '👏'];
  
  return (
    <div className="absolute bottom-12 left-0 bg-white border rounded-lg shadow-lg p-2 grid grid-cols-5 gap-2 z-10">
      {emojis.map((emoji, index) => (
        <button
          key={index}
          onClick={() => onSelect(emoji)}
          className="text-xl hover:bg-gray-100 rounded p-1"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

// Static data with richer chat features
const staticQueries = [
  {
    _id: "1",
    patientId: "123",
    content: "What should I do if I experience side effects from the medication?",
    reply: "If you experience any side effects, please stop taking the medication immediately and contact our emergency line at 1-800-123-4567.",
    createdAt: "2024-03-10T10:30:00Z",
    status: "answered",
    from: "patient",
    read: true,
    delivered: true,
    attachments: [],
    reactions: [],
    isAIEnhanced: true
  },
  {
    _id: "2",
    patientId: "123",
    content: "When is my next follow-up appointment?",
    reply: "Your next follow-up appointment is scheduled for March 25th, 2024 at 2:00 PM with Dr. Smith. Please bring your medical reports.",
    createdAt: "2024-03-09T14:20:00Z",
    status: "answered",
    from: "patient",
    read: true,
    delivered: true,
    attachments: [],
    reactions: [{ emoji: "👍", by: "doctor" }],
    isAIEnhanced: false
  },
  {
    _id: "3",
    patientId: "123",
    content: "Can I take my medication with food? I've been experiencing nausea.",
    reply: null,
    createdAt: "2024-03-11T09:15:00Z",
    status: "pending",
    from: "patient",
    read: false,
    delivered: true,
    attachments: [],
    reactions: [],
    isAIEnhanced: true
  },
  {
    _id: "4",
    patientId: "123",
    content: "Please take your blood pressure reading tomorrow morning before breakfast and share the results.",
    reply: null,
    createdAt: "2024-03-11T08:00:00Z",
    status: "info",
    from: "doctor",
    read: true,
    delivered: true,
    attachments: [
      { type: "image", url: "https://via.placeholder.com/150", name: "blood-pressure-chart.png" }
    ],
    reactions: [],
    isAIEnhanced: false
  },
  {
    _id: "5",
    patientId: "123",
    content: "Here's the report you asked for",
    reply: "Thank you for sharing. The results look normal.",
    createdAt: "2024-03-10T16:45:00Z",
    status: "answered",
    from: "patient",
    read: true,
    delivered: true,
    attachments: [
      { type: "pdf", url: "#", name: "lab-report.pdf", size: "2.4 MB" }
    ],
    reactions: [],
    isAIEnhanced: false
  }
];

const QuerySection = () => {
  const { patientId } = useParams();
  const [queries, setQueries] = useState(staticQueries);
  const [loading, setLoading] = useState(false);
  const [editingQuery, setEditingQuery] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const chatContainerRef = useRef(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: { content: "" },
  });

  const messageContent = watch("content");

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [queries]);

  // Filter and sort queries
  const filteredQueries = queries.filter(query => {
    if (activeFilter === "pending") return query.status === "pending";
    if (activeFilter === "answered") return query.status === "answered";
    if (activeFilter === "unread") return !query.read;
    if (activeFilter === "attachments") return query.attachments?.length > 0;
    return true;
  }).filter(query => 
    query.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.reply?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedQueries = [...filteredQueries].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Add or update query
  const onSubmit = async (data) => {
    setLoading(true);
    
    setTimeout(() => {
      if (editingQuery) {
        setQueries(prev => prev.map(query =>
          query._id === editingQuery._id
            ? { 
                ...query, 
                content: data.content, 
                updatedAt: new Date().toISOString(),
                edited: true
              }
            : query
        ));
        setEditingQuery(null);
      } else {
        const newQuery = {
          _id: Date.now().toString(),
          patientId: patientId || "123",
          content: data.content,
          reply: null,
          createdAt: new Date().toISOString(),
          status: "pending",
          from: "patient",
          read: false,
          delivered: false,
          attachments: selectedFiles,
          reactions: [],
          isAIEnhanced: Math.random() > 0.7 // Randomly mark as AI enhanced
        };
        setQueries(prev => [...prev, newQuery]);
        setSelectedFiles([]);
        
        // Simulate delivery and read status
        setTimeout(() => {
          setQueries(prev => prev.map(q => 
            q._id === newQuery._id ? { ...q, delivered: true } : q
          ));
        }, 1000);
        
        setTimeout(() => {
          setQueries(prev => prev.map(q => 
            q._id === newQuery._id ? { ...q, read: true } : q
          ));
        }, 3000);
      }
      
      reset();
      setLoading(false);
      setShowEmojiPicker(false);
    }, 500);
  };

  // File upload handler
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      type: file.type.startsWith('image/') ? 'image' : 
             file.type.startsWith('video/') ? 'video' : 'file',
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      url: URL.createObjectURL(file)
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  // Remove attached file
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Add reaction to message
  const addReaction = (queryId, emoji) => {
    setQueries(prev => prev.map(query =>
      query._id === queryId
        ? { 
            ...query, 
            reactions: [...(query.reactions || []), { emoji, by: "user" }]
          }
        : query
    ));
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date header
  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  // Group messages by date
  const groupedMessages = sortedQueries.reduce((groups, message) => {
    const date = formatDateHeader(message.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  // AI Quick Suggestions
  const quickSuggestions = [
    "Medication side effects?",
    "Appointment rescheduling",
    "Prescription refill",
    "Test results inquiry",
    "Emergency contact",
    "Dietary restrictions"
  ];

  // Generate AI insights
  const generateAIInsights = () => {
    const pending = queries.filter(q => q.status === "pending").length;
    const urgentTopics = queries.filter(q => 
      q.content.toLowerCase().includes('emergency') || 
      q.content.toLowerCase().includes('urgent') ||
      q.content.toLowerCase().includes('pain')
    );
    
    return {
      pendingCount: pending,
      urgentTopics: urgentTopics.length,
      averageResponseTime: "4.2 hours",
      suggestedTopics: ["Medication adherence", "Follow-up scheduling"],
      sentiment: "Positive"
    };
  };

  const aiInsights = generateAIInsights();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white font-semibold">DR</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-800">Dr. Smith's Clinic</h1>
            <p className="text-xs text-gray-500">Patient: John Doe • ID: {patientId || "123"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search messages..."
              className="pl-9 pr-3 py-1.5 text-sm border rounded-full w-40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="p-2 hover:bg-gray-100 rounded-full relative"
              title="AI Insights"
            >
              <Bot className="w-5 h-5 text-purple-600" />
              {aiInsights.pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {aiInsights.pendingCount}
                </span>
              )}
            </button>
            
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-white p-4 overflow-y-auto">
          <div className="mb-6">
            <h2 className="font-semibold text-gray-700 mb-3">Filters</h2>
            <div className="space-y-1">
              {["all", "unread", "pending", "answered", "attachments"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm capitalize ${
                    activeFilter === filter
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {filter}
                  {filter === "unread" && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {queries.filter(q => !q.read).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-semibold text-gray-700 mb-3">Quick Suggestions</h2>
            <div className="space-y-2">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setValue("content", suggestion);
                    setShowEmojiPicker(false);
                  }}
                  className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg w-full text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-semibold text-gray-700 mb-3">Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Messages</span>
                <span className="font-semibold">{queries.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span className="font-semibold text-green-600">
                  {((queries.filter(q => q.status === "answered").length / queries.length) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Response Time</span>
                <span className="font-semibold">4.2h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* AI Insights Panel */}
          {showAIInsights && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">AI Insights</h3>
                </div>
                <button onClick={() => setShowAIInsights(false)} className="text-gray-500">
                  ×
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-3">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">{aiInsights.pendingCount}</div>
                  <div className="text-xs text-gray-600">Pending Replies</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{aiInsights.urgentTopics}</div>
                  <div className="text-xs text-gray-600">Urgent Topics</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{aiInsights.averageResponseTime}</div>
                  <div className="text-xs text-gray-600">Avg Response Time</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{aiInsights.sentiment}</div>
                  <div className="text-xs text-gray-600">Sentiment</div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50"
          >
            {Object.entries(groupedMessages).map(([date, messages]) => (
              <div key={date}>
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {date}
                  </div>
                </div>
                
                {messages.map((query) => (
                  <div key={query._id} className={`flex ${query.from === "doctor" ? "" : "justify-end"}`}>
                    <div className={`max-w-[70%] ${query.from === "doctor" ? "mr-auto" : "ml-auto"}`}>
                      {/* Sender Info */}
                      <div className="flex items-center gap-2 mb-1">
                        {query.from === "doctor" && (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">DR</span>
                          </div>
                        )}
                        <span className="text-xs font-medium text-gray-500">
                          {query.from === "doctor" ? "Dr. Smith" : "You"}
                        </span>
                        <span className="text-xs text-gray-400">{formatTime(query.createdAt)}</span>
                        {query.edited && (
                          <span className="text-xs text-gray-400">(edited)</span>
                        )}
                        {query.isAIEnhanced && (
                          <Bot className="w-3 h-3 text-purple-600" title="AI Enhanced" />
                        )}
                      </div>
                      
                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl p-3 ${
                          query.from === "doctor"
                            ? "bg-white border border-gray-200 rounded-tl-none"
                            : "bg-blue-500 text-white rounded-br-none"
                        }`}
                      >
                        <p className={query.from === "doctor" ? "text-gray-800" : "text-white"}>
                          {query.content}
                        </p>
                        
                        {/* Attachments */}
                        {query.attachments?.map((file, idx) => (
                          <div 
                            key={idx} 
                            className="mt-2 p-2 bg-black/10 rounded-lg"
                          >
                            {file.type === 'image' ? (
                              <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                <span className="text-sm">Image: {file.name}</span>
                              </div>
                            ) : file.type === 'video' ? (
                              <div className="flex items-center gap-2">
                                <Video className="w-4 h-4" />
                                <span className="text-sm">Video: {file.name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <div>
                                  <div className="text-sm">{file.name}</div>
                                  <div className="text-xs opacity-75">{file.size}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Doctor's Reply */}
                        {query.reply && (
                          <div className={`mt-3 p-3 rounded-lg ${
                            query.from === "doctor" 
                              ? "bg-blue-50 border border-blue-100" 
                              : "bg-white/20"
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                              <span className={`text-xs font-medium ${
                                query.from === "doctor" ? "text-blue-600" : "text-white/90"
                              }`}>
                                Reply
                              </span>
                            </div>
                            <p className={query.from === "doctor" ? "text-gray-700" : "text-white"}>
                              {query.reply}
                            </p>
                          </div>
                        )}
                        
                        {/* Reactions */}
                        {query.reactions?.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {query.reactions.map((reaction, idx) => (
                              <div 
                                key={idx} 
                                className="text-xs bg-white/20 px-2 py-0.5 rounded-full"
                              >
                                {reaction.emoji}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Message Status */}
                        {query.from === "patient" && (
                          <div className="flex items-center justify-end gap-1 mt-2">
                            {query.read ? (
                              <CheckCheck className="w-4 h-4 text-blue-400" />
                            ) : query.delivered ? (
                              <CheckCheck className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Check className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-xs opacity-75">
                              {formatTime(query.createdAt)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => addReaction(query._id, "👍")}
                          className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        {query.from === "patient" && (
                          <>
                            <button
                              onClick={() => {
                                setEditingQuery(query);
                                setValue("content", query.content);
                              }}
                              className="text-gray-400 hover:text-blue-600 text-sm"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Delete this message?")) {
                                  setQueries(prev => prev.filter(q => q._id !== query._id));
                                }
                              }}
                              className="text-gray-400 hover:text-red-600 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="border-t bg-white p-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 min-w-40">
                    {file.type === 'image' ? (
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                    ) : file.type === 'video' ? (
                      <Video className="w-4 h-4 text-purple-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-gray-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate">{file.name}</div>
                      <div className="text-xs text-gray-500">{file.size}</div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="border-t bg-white p-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    {...register("content", { required: true })}
                    placeholder="Type your message..."
                    className="w-full border rounded-2xl p-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={1}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(onSubmit)();
                      }
                    }}
                  />
                  
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-gray-400 hover:text-yellow-500"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    
                    <label className="cursor-pointer text-gray-400 hover:text-blue-500">
                      <Paperclip className="w-5 h-5" />
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,video/*,.pdf,.doc,.docx"
                      />
                    </label>
                  </div>
                  
                  {showEmojiPicker && (
                    <EmojiPicker onSelect={(emoji) => {
                      setValue("content", messageContent + emoji);
                      setShowEmojiPicker(false);
                    }} />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-blue-500"
                    onClick={() => setIsRecording(!isRecording)}
                  >
                    <Mic className={`w-5 h-5 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} />
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || (!messageContent?.trim() && selectedFiles.length === 0)}
                    className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setValue("content", messageContent + " ❤️ ")}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
                >
                  Add Heart
                </button>
                <button
                  type="button"
                  onClick={() => setValue("content", messageContent + " 🏥 ")}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
                >
                  Hospital
                </button>
                <button
                  type="button"
                  onClick={() => setValue("content", messageContent + " 💊 ")}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
                >
                  Medication
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const aiSuggestion = "Based on your symptoms, I recommend...";
                    setValue("content", messageContent + aiSuggestion);
                  }}
                  className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1"
                >
                  <Bot className="w-3 h-3" />
                  AI Help
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuerySection;