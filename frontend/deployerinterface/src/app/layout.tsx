import AppWalletProvider from './components/AppWalletProvider';
import Bubbles from './components/Bubble';
import PrelineScript from './components/PrelineScript';
import './globals.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <html lang="en">
            <body className="">
            <script src="./node_modules/preline/dist/preline.js"></script>
            <AppWalletProvider>
            <Bubbles />
                {children}
                <PrelineScript />
                
                </AppWalletProvider>

               
            </body>
        </html>
    );
};

export default Layout;
