

const DemoPage = () => {



  return (
   <div className="h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[linear-gradient(to_bottom,_#102f42_0%,_#19141d_40%,_#201628_60%,_#531975_100%)]">
      {/* Stars */}
      <div className="absolute inset-0 bg-[radial-gradient(white,transparent_1px)] [background-size:2px_2px] opacity-20 animate-pulse"></div>

      {/* Aurora light waves */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[70vw] h-[60vh] bg-gradient-to-r from-teal-400/20 via-purple-500/30 to-pink-500/10 blur-3xl animate-aurora" />
        <div className="absolute bottom-0 right-1/4 w-[80vw] h-[50vh] bg-gradient-to-l from-indigo-400/20 via-fuchsia-400/20 to-green-400/20 blur-3xl animate-aurora" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white">
        <h1 className="text-4xl font-bold drop-shadow-md">Connect your ideas to the world</h1>
        <p className="mt-3 text-gray-300 drop-shadow-sm">
          Your website deserves a home on the web — make it global with WebGen.
        </p>
      </div>
    </div>


  )
}

export default DemoPage