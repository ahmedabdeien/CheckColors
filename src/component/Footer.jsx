import React from 'react'

export default function Footer() {
  return (
   <footer className="bg-gray-900 text-white py-12">
   <div className="max-w-6xl mx-auto px-4 text-center">
     <h2 className="text-2xl font-bold mb-6">Ready to Create Something Beautiful?</h2>
     <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all">
       Start Exploring Colors
     </button>
     <div className="mt-8 text-gray-400">
       © 2024 ColorPalettes. All rights reserved.
     </div>
   </div>
 </footer>
  )
}
