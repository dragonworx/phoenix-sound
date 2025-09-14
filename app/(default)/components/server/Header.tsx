export default function Header() {
  return (
    <header className="bg-gray-800 text-white w-full p-2.5 sticky top-0 z-10">
      <div className="flex">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex"></div>
          <h1 className="text-xl font-bold">Welcome to My Website</h1>
        </div>
      </div>
    </header>
  );
}
