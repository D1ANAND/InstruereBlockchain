import AppWalletProvider from './components/AppWalletProvider';
import './globals.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <html lang="en">
            {/* <body>{children}</body> */}
            <body className="">
            <AppWalletProvider>{children}</AppWalletProvider>
            </body>
        </html>
    );
};

export default Layout;
