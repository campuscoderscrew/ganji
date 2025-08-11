import { MapPin, Calendar } from "lucide-react"

export default function Performances() {
    return (
        <>
            <div className="w-full h-[calc(100%-4rem)] bg-[#D1D1FF] pb-20">

                {/* Header text */}
                <div className="w-[70%] max-w-150 m-auto relative top-15 text-center box-border px-10">
                    <h1 className="text-4xl text-[#4D11A7]  mb-4">Performances</h1>
                    <p className="mb-6 text-[#4D11A7]">A short description about what this page contains, something fun and cute! Lorem ipsum sit amet dolor, lorem ipsum sit amet dolor</p>
                    <div className="flex items-center gap-2 justify-center">
                        <p>Want to see more? Check out</p>
                        <button className="rounded-full bg-white px-4 py-1  text-[#4D11A7] font-[500]">Channel Name</button>
                    </div>
                </div>

                {/* Peformance view */}

                <div className="h-fit max-h-105 mt-30 m-auto rounded-lg flex w-fit">

                    <div className="w-100 bg-white rounded-l-lg p-8 flex flex-col gap-4">
                        <h1 className="text-2xl">La Plaza Performance</h1>
                        <p>Some fun description about the event and what will happen! Lorem ipsum sit amet dolor, lorem ipsum sit amet dolor </p>

                        <h3 className="text-xl">Songs</h3>
                        <div className="flex gap-8">
                            <div className="flex rounded-lg w-max gap-2">
                                <img className="h-10 aspect-square bg-[#D1D1FF]"></img>
                                <div className="text-sm">
                                    <p className="">Cool Song Name</p>
                                    <p className="text-gray-500 text-sm">Artist</p>
                                </div>
                            </div>

                            <div className="flex rounded-lg w-max gap-2">
                                <img className="h-10 aspect-square bg-[#D1D1FF]"></img>
                                <div className="text-sm">
                                    <p className="">Cool Song Name</p>
                                    <p className="text-gray-500 text-sm">Artist</p>
                                </div>
                            </div>

                        </div>

                        <h3 className="text-xl">Where</h3>
                        <span className="flex gap-2 items-center">
                            <MapPin className="text-[#adadff] stroke-2  rounded-full" />
                            123 Some Random St, False Lane, 10101
                        </span>

                        <span className="flex gap-2 items-center">
                            <Calendar className="text-[#adadff] stroke-2  rounded-full" />
                            July 31 <span className="font-bold">∙</span> 5:00 - 7:00 PM
                        </span>


                    </div>

                    <div className="h-105 w-max rounded-r-lg">
                        <img src="https://sfrecpark.org/ImageRepository/Document?documentId=25763" className="w-full h-full object-cover rounded-r-lg" />
                    </div>

                    {/* https://sfrecpark.org/ImageRepository/Document?documentId=25763 */}

                </div>

            </div >
        </>
    )
}