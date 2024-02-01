import { useSelector } from "react-redux";

const LeaderBoard = () => {

   const participants = useSelector((state: any) => state.leaderboard.participants);

  return (
    <div className="relative flex flex-col w-full min-w-0 mb-0 break-words bg-white border-0 border-transparent border-solid shadow-soft-xl rounded-2xl bg-clip-border mb-4 draggable">
  <div className="p-6 pb-0 mb-0 bg-white rounded-t-2xl">
    <h6>Authors table</h6>
  </div>
  <div className="flex-auto px-0 pt-0 pb-2">
    <div className="p-0 overflow-x-auto">
      <table className="items-center w-full mb-0 align-top border-gray-200 text-slate-500">
        <thead className="align-bottom">
          <tr>
            <th className="px-6 py-3 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">Author</th>
            <th className="px-6 py-3 pl-2 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">Function</th>
            <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">Status</th>
            <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">Employed</th>
            <th className="px-6 py-3 font-semibold capitalize align-middle bg-transparent border-b border-gray-200 border-solid shadow-none tracking-none whitespace-nowrap text-slate-400 opacity-70"></th>
          </tr>
        </thead>
        <tbody>
          {participants && participants.map(participant => (<tr>
            <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
              <div className="flex px-2 py-1">
                <div>
                  <img src="https://demos.creative-tim.com/soft-ui-dashboard-tailwind/assets/img/team-2.jpg" className="inline-flex items-center justify-center mr-4 text-white transition-all duration-200 ease-soft-in-out text-sm h-9 w-9 rounded-xl" alt="user1" />
                </div>
                <div className="flex flex-col justify-center">
                  <h6 className="mb-0 leading-normal text-sm">{participant.username}</h6>
                  <p className="mb-0 leading-tight text-xs text-slate-400">john@creative-tim.com</p>
                </div>
              </div>
            </td>
            <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
              <p className="mb-0 font-semibold leading-tight text-xs">Manager</p>
              <p className="mb-0 leading-tight text-xs text-slate-400">Organization</p>
            </td>
            <td className="p-2 leading-normal text-center align-middle bg-transparent border-b text-sm whitespace-nowrap shadow-transparent">
              <span className="bg-gradient-to-tl from-green-600 to-lime-400 px-2 text-xxs rounded py-1 inline-block whitespace-nowrap text-center align-baseline font-bold uppercase leading-none text-white">Online</span>
            </td>
            <td className="p-2 text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
              <span className="font-semibold leading-tight text-xs text-slate-400">23/04/18</span>
            </td>
            <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
              <a href="javascript:;" className="font-semibold leading-tight text-xs text-slate-400"> Edit </a>
            </td>
          </tr>)
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
  )

}

export default LeaderBoard