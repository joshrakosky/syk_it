'use client'

import { useState } from 'react'

export default function HelpIcon() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <>
      {/* Help Icon */}
      <button
        onClick={() => setShowHelp(true)}
        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 font-bold text-lg transition-colors shadow-md z-40"
        aria-label="Help"
      >
        ?
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div 
          className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowHelp(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Help & Contact</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">For site questions:</p>
                <a 
                  href="mailto:mpp.ecomm@proforma.com"
                  className="text-[#ffb500] hover:underline font-medium"
                >
                  mpp.ecomm@proforma.com
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">For order questions:</p>
                <a 
                  href="mailto:metroinfo@proforma.com"
                  className="text-[#ffb500] hover:underline font-medium"
                >
                  metroinfo@proforma.com
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

