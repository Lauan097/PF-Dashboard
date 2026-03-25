import MotionWrapper from './components/MotionWrapper'

export default function RootLayout({ children }) {
  return (
    <main>
      <MotionWrapper>
        <div className="container mx-auto min-h-screen py-12 max-w-7xl">
          {children}
        </div>
      </MotionWrapper>
    </main>
  );
}