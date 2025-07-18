import React, { useRef, useState } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    elements,
    Filler,
    scales,
    TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import {id} from 'date-fns/locale';
import { Line, defaults } from 'react-chartjs-2'
import { Download } from 'lucide-react';
import { Button } from './ui/button';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale
)

ChartJS.defaults.font.family="Instrument Sans"


export const ChartGraph=({
    title="",

    labels=[],
    datasets=[]
})=>{
    const chartRef=useRef(null)

    const options={
        responsive: true,
        maintainAspectRatio:false,
        plugins: {
            legend: false,
            title: false
        },
        interaction:{
            intersect:false,
            mode:"nearest",
            axis:"x"
        },
        scales:{
            x:{
                type:"time",
                time:{
                    unit:"day"
                },
                title:{
                    display:true,
                    text:"Umur Tanaman (bulan)"
                },
                grid:{
                    display:false
                },
                adapters:{
                    date:{
                        locale:id
                    }
                }
            },
            y:{
                title:{
                    display:true,
                    text:"Data"
                },
                border:{
                    display:false
                }
            }
        }
    }

    const data={
        labels:[
            new Date(2025, 6, 16),
            new Date(2025, 6, 17),
            new Date(2025, 6, 18),
            new Date(2025, 6, 19),
            new Date(2025, 6, 20),
            new Date(2025, 6, 21),
            new Date(2025, 6, 22),
            new Date(2025, 6, 23),
        ],
        datasets:[
            {
                label: 'Data Aktual',
                data: [{x:new Date(2025, 6, 16, 10, 30), y:45}, {x:new Date(2025, 6, 17, 1, 30), y:23}, {x:new Date(2025, 6, 17, 2), y:32}, {x:new Date(2025, 6, 17, 2, 30), y:28}],
                borderColor: 'rgb(35, 143, 250)',
                backgroundColor: 'rgba(35, 143, 250, 0.4)',
                borderWidth:1,
                pointBorderWidth:0,
                pointRadius:1,
                tension:.2,
                fill:true
            },
            {
                label: 'Data Ideal',
                data: [],
                borderColor: 'rgb(35, 143, 250)',
                backgroundColor: 'rgba(35, 143, 250, 0.1)',
                tension:.4,
                fill:true
            }
        ]
    }

    return (
        <div className="w-full px-3 py-3">
            <div className='bg-white dark:bg-sidebar p-5 rounded-xl shadow-sm'>
                <h4 className='text-muted-foreground mb-5'>{title}</h4>
                <div className='h-[350px] mb-5'>
                    <Line 
                        ref={chartRef}
                        options={options} 
                        data={data} 
                    />
                </div>
                <div className=''>
                    <Button 
                        variant="outline"
                        className='rounded-full'
                        onClick={()=>{
                            const image=chartRef.current.toBase64Image()

                            const a=document.createElement("a")
                            a.href=image
                            a.download="chart.png"
                            a.click()
                            
                        }}
                    >
                        Download Report <Download className='ml-2'/>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export const WidgetLineChartTimeTanah=({title="", isHour=false, labels=[], datasets=[]})=>{
    const chartRef=useRef(null)

    const options={
        responsive: true,
        maintainAspectRatio:false,
        plugins: {
            legend: false,
            title: false
        },
        interaction:{
            intersect:false,
            mode:"nearest",
            axis:"x"
        },
        scales:{
            x:{
                type:"time",
                time:{
                    unit:isHour?"hour":"day"
                },
                title:{
                    display:true,
                    text:"Tanggal/Waktu"
                },
                grid:{
                    display:false
                },
                adapters:{
                    date:{
                        locale:id
                    }
                }
            },
            y:{
                title:{
                    display:true,
                    text:"Data"
                },
                border:{
                    display:false
                }
            }
        }
    }

    const data={
        labels,
        datasets
    }

    return (
        <div className="w-full px-3 py-3">
            <div className='bg-white dark:bg-sidebar p-5 rounded-xl shadow-sm'>
                <h4 className='text-muted-foreground mb-5'>{title}</h4>
                <div className='h-[350px] mb-5'>
                    <Line 
                        ref={chartRef}
                        options={options} 
                        data={data} 
                    />
                </div>
                <div className=''>
                    <Button 
                        variant="outline"
                        className='rounded-full py-2'
                        onClick={()=>{
                            const image=chartRef.current.toBase64Image()

                            const a=document.createElement("a")
                            a.href=image
                            a.download="chart.png"
                            a.click()
                            
                        }}
                    >
                        Download Report <Download className='ml-1'/>
                    </Button>
                </div>
            </div>
        </div>
    )
}