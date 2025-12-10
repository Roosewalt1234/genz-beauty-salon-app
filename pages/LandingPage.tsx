import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../App';
import { MOCK_TENANTS } from '../constants';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { tenants, setCurrentTenantId } = useContext(DataContext);
    const displayServices = MOCK_TENANTS[0]?.services || [];

    const handleSignIn = () => {
        navigate('/signin');
    };

    const handleEnterDashboard = (tenantId: string) => {
        setCurrentTenantId(tenantId);
    };

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative h-screen flex items-center justify-center text-white text-center px-4" style={{ backgroundImage: "url('https://source.unsplash.com/1920x1080/?flowers,floral,beauty')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-pink/70 to-lavender-purple/70"></div>
                <div className="relative z-10">
                    <img src="https://sopkcpmuhwktnrkbgabx.supabase.co/storage/v1/object/sign/Logo/GenZ%20salon%20logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80MDY0MDM1OC1mYWIwLTRlN2MtYmExNy0yYTZjZDc1N2UwNTAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMb2dvL0dlblogc2Fsb24gbG9nby5wbmciLCJpYXQiOjE3NjIwMDg3OTIsImV4cCI6MTg0ODQwODc5Mn0._eh1bvBGE3w5fAnZxsNAEAgJWIZbLo8PnjHEAESmwF0" alt="GenZ Salon Logo" className="w-30.4 h-30.4 mx-auto mb-4 rounded-full" />
                    <h1 className="text-5xl md:text-7xl font-bold mb-4" style={{fontFamily: "'Playfair Display', serif"}}>Welcome to GenZ Salon</h1>
                    <p className="text-lg md:text-2xl mb-8 max-w-3xl mx-auto">The all-in-one management solution for your beauty salon. Streamline bookings, manage clients, and empower your staff with modern technology.</p>
                    <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                        <div className="flex justify-center">
                            <button
                                onClick={handleSignIn}
                                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                            >
                                Sign In
                            </button>
                        </div>
                          <p className="mt-4 text-sm text-white/80">Welcome to your beauty salon management system</p>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center text-gray-800 mb-12" style={{fontFamily: "'Playfair Display', serif"}}>Why Choose Glamoir?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <h3 className="text-2xl font-semibold text-rose-pink mb-4">Client Management</h3>
                            <p className="text-gray-600">Keep track of client profiles, service history, and preferences to provide a personalized experience every time.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <h3 className="text-2xl font-semibold text-lavender-purple mb-4">Smart Scheduling</h3>
                            <p className="text-gray-600">Effortlessly manage appointments for your entire team with an intuitive booking system, avoiding double bookings.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <h3 className="text-2xl font-semibold text-rose-pink mb-4">Staff Empowerment</h3>
                            <p className="text-gray-600">Automated notifications for new bookings and onboarding keeps your staff informed and engaged.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center text-gray-800 mb-12" style={{fontFamily: "'Playfair Display', serif"}}>Our Services</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayServices.map((service, index) => (
                             <div key={service.id} className="bg-light-pink/50 border border-rose-pink/20 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xl font-semibold text-gray-700">{service.name}</h4>
                                    <p className="text-2xl font-bold text-rose-pink">${service.price}</p>
                                </div>
                                <p className="text-gray-500 mt-2">{service.duration} minutes</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

             {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto text-center">
                    <p>&copy; {new Date().getFullYear()} GenZ Salon. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;