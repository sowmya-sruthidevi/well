import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="flex justify-between items-center 
    px-10 py-4 bg-white/10 backdrop-blur-lg border-b border-white/10">

      <h1 className="text-xl font-bold text-white">
        AI Interview
      </h1>

      {user && (
        <div className="flex items-center gap-3 text-white">

          {user.photoPreview && (
            <img
              src={user.photoPreview}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          )}

          <span className="font-medium">
            {user.fullName}
          </span>

        </div>
      )}

    </div>
  );
}