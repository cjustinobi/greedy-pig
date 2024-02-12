
const UpcomingGames = () => {
  return (

  <div>
    <h1 className="mt-4 mb-0 text-gray-500 text-center text-2xl font-bold cursor-pointer">Upcoming Games</h1>
    <div className="min-h-screen bg-gradient-to-r from-black-500 to-brown-800 via-[#333] flex justify-center items-center">
    <div className="md:px-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 space-y-4 md:space-y-0">
      <div className="max-w-sm px-6 pt-6 pb-2 rounded-xl shadow-lg transform hover:scale-105 transition duration-500">
        {/* <h3 className="mb-3 text-xl font-bold text-indigo-600">Beginner Friendly</h3> */}
        <div className="relative">
          <img className="w-full rounded-xl" src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80" alt="Colors" />
          <p className="absolute top-0 bg-yellow-300 text-gray-500 font-semibold py-1 px-3 rounded-br-lg rounded-tl-lg">FREE</p>
        </div>
        <h1 className="mt-4 text-gray-500 text-2xl font-bold cursor-pointer">Solidity Meetup</h1>
        <div className="my-4">
          <div className="flex space-x-1 items-center">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <p>1:34:23 Minutes</p>
          </div>
          <div className="flex space-x-1 items-center">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <p>Turn Based</p>
          </div>
          <div className="flex space-x-1 items-center">
            <span>
              <svg className="w-[25px] h-[25px] fill-indigo-600" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <path d="M4.1 38.2C1.4 34.2 0 29.4 0 24.6C0 11 11 0 24.6 0H133.9c11.2 0 21.7 5.9 27.4 15.5l68.5 114.1c-48.2 6.1-91.3 28.6-123.4 61.9L4.1 38.2zm503.7 0L405.6 191.5c-32.1-33.3-75.2-55.8-123.4-61.9L350.7 15.5C356.5 5.9 366.9 0 378.1 0H487.4C501 0 512 11 512 24.6c0 4.8-1.4 9.6-4.1 13.6zM80 336a176 176 0 1 1 352 0A176 176 0 1 1 80 336zm184.4-94.9c-3.4-7-13.3-7-16.8 0l-22.4 45.4c-1.4 2.8-4 4.7-7 5.1L168 298.9c-7.7 1.1-10.7 10.5-5.2 16l36.3 35.4c2.2 2.2 3.2 5.2 2.7 8.3l-8.6 49.9c-1.3 7.6 6.7 13.5 13.6 9.9l44.8-23.6c2.7-1.4 6-1.4 8.7 0l44.8 23.6c6.9 3.6 14.9-2.2 13.6-9.9l-8.6-49.9c-.5-3 .5-6.1 2.7-8.3l36.3-35.4c5.6-5.4 2.5-14.8-5.2-16l-50.1-7.3c-3-.4-5.7-2.4-7-5.1l-22.4-45.4z"></path>

</svg>
            </span>
            <p>Roulette</p>
          </div>
          <button className="mt-4 text-xl w-full text-white bg-indigo-600 py-2 rounded-xl shadow-lg">Join</button>
        </div>
      </div>
      <div className="max-w-sm px-6 pt-6 pb-2 rounded-xl shadow-lg transform hover:scale-105 transition duration-500">
        {/* <h3 className="mb-3 text-xl font-bold text-indigo-600">Intermediate</h3> */}
        <div className="relative">
          <img className="w-full rounded-xl" src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80" alt="Colors" />
          <p className="absolute top-0 bg-yellow-300 text-gray-500 font-semibold py-1 px-3 rounded-br-lg rounded-tl-lg">$12</p>
          {/* <p className="absolute top-0 right-0 bg-yellow-300 text-gray-500 font-semibold py-1 px-3 rounded-tr-lg rounded-bl-lg">%20 Discount</p> */}
        </div>
        <h1 className="mt-4 text-gray-500 text-2xl font-bold cursor-pointer">Write a Gatsby plugin</h1>
        <div className="my-4">
          <div className="flex space-x-1 items-center">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <p>1:34:23 Minutes</p>
          </div>
          <div className="flex space-x-1 items-center">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <p>Turn Based</p>
          </div>
          <div className="flex space-x-1 items-center">
            <span>
              <svg className="w-[25px] h-[25px] fill-indigo-600" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">

  <path d="M4.1 38.2C1.4 34.2 0 29.4 0 24.6C0 11 11 0 24.6 0H133.9c11.2 0 21.7 5.9 27.4 15.5l68.5 114.1c-48.2 6.1-91.3 28.6-123.4 61.9L4.1 38.2zm503.7 0L405.6 191.5c-32.1-33.3-75.2-55.8-123.4-61.9L350.7 15.5C356.5 5.9 366.9 0 378.1 0H487.4C501 0 512 11 512 24.6c0 4.8-1.4 9.6-4.1 13.6zM80 336a176 176 0 1 1 352 0A176 176 0 1 1 80 336zm184.4-94.9c-3.4-7-13.3-7-16.8 0l-22.4 45.4c-1.4 2.8-4 4.7-7 5.1L168 298.9c-7.7 1.1-10.7 10.5-5.2 16l36.3 35.4c2.2 2.2 3.2 5.2 2.7 8.3l-8.6 49.9c-1.3 7.6 6.7 13.5 13.6 9.9l44.8-23.6c2.7-1.4 6-1.4 8.7 0l44.8 23.6c6.9 3.6 14.9-2.2 13.6-9.9l-8.6-49.9c-.5-3 .5-6.1 2.7-8.3l36.3-35.4c5.6-5.4 2.5-14.8-5.2-16l-50.1-7.3c-3-.4-5.7-2.4-7-5.1l-22.4-45.4z"></path>

</svg>
            </span>
            <p>Die</p>
          </div>
          <button className="mt-4 text-xl w-full text-white bg-indigo-600 py-2 rounded-xl shadow-lg">Join</button>
        </div>
      </div>
      <div className="max-w-sm px-6 pt-6 pb-2 rounded-xl shadow-lg transform hover:scale-105 transition duration-500">
        {/* <h3 className="mb-3 text-xl font-bold text-indigo-600">Beginner Friendly</h3> */}
        <div className="relative">
          <img className="w-full rounded-xl" src="https://images.unsplash.com/photo-1561835491-ed2567d96913?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80" alt="Colors" />
          <p className="absolute top-0 bg-yellow-300 text-gray-500 font-semibold py-1 px-3 rounded-br-lg rounded-tl-lg">$50</p>
        </div>
        <h1 className="mt-4 text-gray-500 text-2xl font-bold cursor-pointer">Meet and Greet, Ohio</h1>
        <div className="my-4">
          <div className="flex space-x-1 items-center">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <p>1:34:23 Minutes</p>
          </div>
          <div className="flex space-x-1 items-center">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <p>Turn Based</p>
          </div>
          <div className="flex space-x-1 items-center">
            <span>
             <svg className="w-[25px] h-[25px] fill-indigo-600" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">

  <path d="M4.1 38.2C1.4 34.2 0 29.4 0 24.6C0 11 11 0 24.6 0H133.9c11.2 0 21.7 5.9 27.4 15.5l68.5 114.1c-48.2 6.1-91.3 28.6-123.4 61.9L4.1 38.2zm503.7 0L405.6 191.5c-32.1-33.3-75.2-55.8-123.4-61.9L350.7 15.5C356.5 5.9 366.9 0 378.1 0H487.4C501 0 512 11 512 24.6c0 4.8-1.4 9.6-4.1 13.6zM80 336a176 176 0 1 1 352 0A176 176 0 1 1 80 336zm184.4-94.9c-3.4-7-13.3-7-16.8 0l-22.4 45.4c-1.4 2.8-4 4.7-7 5.1L168 298.9c-7.7 1.1-10.7 10.5-5.2 16l36.3 35.4c2.2 2.2 3.2 5.2 2.7 8.3l-8.6 49.9c-1.3 7.6 6.7 13.5 13.6 9.9l44.8-23.6c2.7-1.4 6-1.4 8.7 0l44.8 23.6c6.9 3.6 14.9-2.2 13.6-9.9l-8.6-49.9c-.5-3 .5-6.1 2.7-8.3l36.3-35.4c5.6-5.4 2.5-14.8-5.2-16l-50.1-7.3c-3-.4-5.7-2.4-7-5.1l-22.4-45.4z"></path>

</svg>
            </span>
            <p>Roulette</p>
          </div>
          <button className="mt-4 text-xl w-full text-white bg-indigo-600 py-2 rounded-xl shadow-lg">Buy Lesson</button>
        </div>
      </div>
    </div>
    </div>
  </div>
  )
}

export default UpcomingGames