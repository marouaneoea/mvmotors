import { Link } from 'react-router-dom';
import { useState } from 'react';

function Navbar() {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-black text-white shadow-md">
            <div className="max-w-screen-xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="text-2xl font-semibold text-yellow-500">
                    <Link to="/">MV Motors</Link>
                </div>

                {/* Mobile Hamburger Icon */}
                <div className="lg:hidden">
                    <button
                        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-white focus:outline-none"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            ></path>
                        </svg>
                    </button>
                </div>

                <div
                    className={`${
                        isMobileMenuOpen ? 'block' : 'hidden'
                    } lg:flex space-x-6`}
                >
                    <Link
                        to="/"
                        className="text-white hover:text-yellow-500 transition duration-200"
                    >
                        Home
                    </Link>
                    <Link
                        to="/cars"
                        className="text-white hover:text-yellow-500 transition duration-200"
                    >
                        Cars
                    </Link>
                    <Link
                        to="/contact"
                        className="text-white hover:text-yellow-500 transition duration-200"
                    >
                        Contact
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
