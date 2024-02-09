interface IEmptyPageProps {
  text: string
}

export const EmptyPage = ({ text }: IEmptyPageProps) => {
  return (
    <div
      role="status"
      className="max-w-sm p-4 border border-gray-200 rounded shadow md:p-6 dark:border-gray-700"
    >
      <h2 className="mb-5 te">{text}</h2>
      <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2.5"></div>
      <div className="w-48 h-2 mb-10 bg-gray-200 rounded-full dark:bg-gray-700"></div>
      <div className="flex items-baseline mt-4">
        <div className="w-full bg-gray-200 rounded-t-lg h-72 dark:bg-gray-700"></div>
        <div className="w-full h-56 ms-6 bg-gray-200 rounded-t-lg dark:bg-gray-700"></div>
        <div className="w-full bg-gray-200 rounded-t-lg h-72 ms-6 dark:bg-gray-700"></div>
        <div className="w-full h-64 ms-6 bg-gray-200 rounded-t-lg dark:bg-gray-700"></div>
        <div className="w-full bg-gray-200 rounded-t-lg h-80 ms-6 dark:bg-gray-700"></div>
        <div className="w-full bg-gray-200 rounded-t-lg h-72 ms-6 dark:bg-gray-700"></div>
        <div className="w-full bg-gray-200 rounded-t-lg h-80 ms-6 dark:bg-gray-700"></div>
      </div>
    </div>
  )
}
