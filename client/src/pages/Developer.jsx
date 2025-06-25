import { Linkedin, Mail, Phone, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Developer = () => {
  const developers = [
    {
      id: 1,
      name: "Mesfin Yitbarek",
      role: "Full Stack Developer",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
      linkedin: "https://linkedin.com/in/mesfin-yitbarek-739550287",
      email: "mesfinyitbarek55@gmail.com",
      phone: "0975364420/0965879079"
    },
    {
      id: 2,
      name: "Abenezer Mulugeta",
      role: "Full Stack Developer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      linkedin: "https://linkedin.com/in/michaelchen",
      email: "michael.chen@fcse.edu",
      phone: "0982969690"
    },
    {
      id: 3,
      name: "Firaol Tegene",
      role: "Full Stack Developer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      linkedin: "https://linkedin.com/in/firaol-tegene-a8461a232",
      email: "firaolteg46@gmail.com",
      phone: "0966438359"
    },
    {
      id: 4,
      name: "Metages Hailu ",
      role: "Full Stack Developer",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
      linkedin: "https://linkedin.com/in/metages-hailu-1221582a6",
      email: "metebenu1@gmail.com",
      phone: "0910268279"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 dark:from-slate-900 dark:to-gray-900 transition-all duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Login
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Meet Our Development Team
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              The talented developers behind FCSE Course Offering System
            </p>
          </div>
        </div>

        {/* Developers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {developers.map((developer) => (
            <div 
              key={developer.id}
              className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
            >
              {/* Profile Header */}
              <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700">
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full p-1 shadow-lg border border-gray-100 dark:border-gray-700">
                    <img
                      src={developer.image}
                      alt={developer.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="pt-16 pb-6 px-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                  {developer.name}
                </h3>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-4">
                  {developer.role}
                </p>

                {/* Contact Information */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center text-gray-600 dark:text-gray-400 text-sm">
                    <Mail className="w-4 h-4 mr-2 text-indigo-500" />
                    <span className="truncate">{developer.email}</span>
                  </div>
                  <div className="flex items-center justify-center text-gray-600 dark:text-gray-400 text-sm">
                    <Phone className="w-4 h-4 mr-2 text-indigo-500" />
                    <span>{developer.phone}</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-4">
                  
                  <a
                    href={developer.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-200 group"
                    aria-label={`${developer.name}'s LinkedIn`}
                  >
                    <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </a>
                  <a
                    href={`mailto:${developer.email}`}
                    className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-200 group"
                    aria-label={`Email ${developer.name}`}
                  >
                    <ExternalLink className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
          FCSE Course Offering System &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default Developer;