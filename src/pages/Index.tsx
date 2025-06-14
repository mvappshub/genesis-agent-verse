
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Canvas from '@/components/Canvas';
import StatusBar from '@/components/StatusBar';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-dark text-white flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-6 flex flex-col">
          <Canvas />
        </div>
      </div>
      
      <StatusBar />
    </div>
  );
};

export default Index;
