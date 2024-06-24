import { useEffect } from 'react'

const Drawer = () => {
  useEffect(() => {
    const init = async () => {
      const { Offcanvas, Ripple, Dropdown, initTE } = await import(
        'tw-elements'
      )
      initTE({ Offcanvas, Ripple, Dropdown })
    }
    init()
  }, [])

  return (
    <div>
      <a
        className="me-1.5 inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
        data-twe-offcanvas-toggle
        href="#offcanvasExample"
        role="button"
        aria-controls="offcanvasExample"
        data-twe-ripple-init
        data-twe-ripple-color="light"
      >
        Link with href
      </a>
      <button
        className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
        type="button"
        data-twe-offcanvas-toggle
        data-twe-target="#offcanvasExample"
        aria-controls="offcanvasExample"
        data-twe-ripple-init
        data-twe-ripple-color="light"
      >
        Button with data-twe-target
      </button>

      <div
        className="invisible fixed bottom-0 left-0 top-0 z-[1045] flex w-96 max-w-full -translate-x-full flex-col border-none bg-white bg-clip-padding text-neutral-700 shadow-sm outline-none transition duration-300 ease-in-out data-[twe-offcanvas-show]:transform-none dark:bg-body-dark dark:text-white"
        tabIndex={-1}
        id="offcanvasExample"
        aria-labelledby="offcanvasExampleLabel"
        data-twe-offcanvas-init
      >
        <div className="flex items-center justify-between p-4">
          <h5
            className="mb-0 font-semibold leading-normal"
            id="offcanvasExampleLabel"
          >
            Offcanvas
          </h5>
          <button
            type="button"
            className="box-content rounded-none border-none text-neutral-500 hover:text-neutral-800 hover:no-underline focus:text-neutral-800 focus:opacity-100 focus:shadow-none focus:outline-none dark:text-neutral-400 dark:hover:text-neutral-300 dark:focus:text-neutral-300"
            data-twe-offcanvas-dismiss
            aria-label="Close"
          >
            <span className="[&>svg]:h-6 [&>svg]:w-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </span>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
          <div>
            Some text as placeholder. In real life you can have the elements you
            have chosen. Like, text, images, lists, etc.
          </div>
          <div className="relative mt-4" data-twe-dropdown-ref>
            <button
              className="flex items-center whitespace-nowrap rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
              type="button"
              id="dropdownMenuButton"
              data-twe-dropdown-toggle-ref
              data-twe-ripple-init
              data-twe-ripple-color="light"
            >
              Dropdown button
              <span className="ms-2 w-2 [&>svg]:h-5 [&>svg]:w-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </button>
            <ul
              className="absolute z-[1000] float-left m-0 hidden min-w-max list-none overflow-hidden rounded-lg border-none bg-white bg-clip-padding text-left text-base shadow-lg data-[twe-dropdown-show]:block dark:bg-surface-dark"
              aria-labelledby="dropdownMenuButton1"
              data-twe-dropdown-menu-ref
            >
              <li>
                <a
                  className="block w-full whitespace-nowrap bg-white px-4 py-2 text-sm font-normal text-neutral-700 hover:bg-zinc-200/60 focus:bg-zinc-200/60 focus:outline-none active:bg-zinc-200/60 active:no-underline dark:bg-surface-dark dark:text-white dark:hover:bg-neutral-800/25 dark:focus:bg-neutral-800/25 dark:active:bg-neutral-800/25"
                  href="#"
                  data-twe-dropdown-item-ref
                >
                  Action
                </a>
              </li>
              <li>
                <a
                  className="block w-full whitespace-nowrap bg-white px-4 py-2 text-sm font-normal text-neutral-700 hover:bg-zinc-200/60 focus:bg-zinc-200/60 focus:outline-none active:bg-zinc-200/60 active:no-underline dark:bg-surface-dark dark:text-white dark:hover:bg-neutral-800/25 dark:focus:bg-neutral-800/25 dark:active:bg-neutral-800/25"
                  href="#"
                  data-twe-dropdown-item-ref
                >
                  Another action
                </a>
              </li>
              <li>
                <a
                  className="block w-full whitespace-nowrap bg-white px-4 py-2 text-sm font-normal text-neutral-700 hover:bg-zinc-200/60 focus:bg-zinc-200/60 focus:outline-none active:bg-zinc-200/60 active:no-underline dark:bg-surface-dark dark:text-white dark:hover:bg-neutral-800/25 dark:focus:bg-neutral-800/25 dark:active:bg-neutral-800/25"
                  href="#"
                  data-twe-dropdown-item-ref
                >
                  Something else here
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Drawer
