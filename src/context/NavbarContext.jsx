import { createContext, useContext, useState } from 'react';

const NavbarContext = createContext();

export const NavbarProvider = ({ children }) => {
    const [isNavbarOpen, setIsNavbarOpen] = useState(false);

    return (
        <NavbarContext.Provider value={{ isNavbarOpen, setIsNavbarOpen }}>
            {children}
        </NavbarContext.Provider>
    );
};

export const useNavbar = () => useContext(NavbarContext);