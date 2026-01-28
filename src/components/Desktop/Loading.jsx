import React from 'react';
import { Loader2 } from 'lucide-react';

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center text-gray-700">
      <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
      <h2 className="text-2xl font-semibold">Feature Coming Soon</h2>
      <p className="text-gray-500 mt-2">This section is under development. Please check back later!</p>
     <br /><br />
      <p className="text-sm">
          &copy; 2024 By <span className="font-semibold">CMHW</span>
          {/* with the
          help of <span className="font-semibold">Ayoub Aharmouch</span>,{" "}
          <span className="font-semibold">Noureddine Charifi</span> and{" "}
          <span className="font-semibold">Omar Elmohamedy</span> */}
          . All rights reserved.
        </p>
    </div>
  );
}

export default Loading;
