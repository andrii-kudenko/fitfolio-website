export default function AdminPage() {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-sm text-gray-300">
            Admin tools will go here.
          </p>
        </div>
  
        {/* Empty box 1 */}
        <div className="border border-gray-700 rounded-md bg-[#040707] p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Box 1</h3>
          <p className="text-sm text-gray-300">
            (Empty for now)
          </p>
        </div>
  
        {/* Empty box 2 */}
        <div className="border border-gray-700 rounded-md bg-[#040707] p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Box 2</h3>
          <p className="text-sm text-gray-300">
            (Empty for now)
          </p>
        </div>
      </div>
    );
  }
  