import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button, buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {Select as ReactSelect} from "@/components/select-form"
import { ArrowRight, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Edit2, Ellipsis, Filter, LampWallUp, Plus, PlusIcon, Trash2 } from "lucide-react"
import { NumericFormat } from 'react-number-format'

import { toast } from "sonner"
import axios from "axios"
import { useState } from "react"
import * as yup from "yup"
import { Formik } from 'formik'
import { lahan_detail_request, lahan_request, modbus_sensor_request } from "@/config/request"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Link, router, usePage, Head } from "@inertiajs/react"
import { queryClient } from '@/Config/query_client'
import { DatePicker } from "@/components/datepicker"
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns"
import WidgetTanaman from "@/components/widget.tanaman"
import TanamanPagination from "@/components/widget.tanaman-pagination"
import swal from "sweetalert2"
import withReactContent from 'sweetalert2-react-content'
import TablePagination from "@/components/widget.table-pagination"
import _ from "underscore"
import WidgetGaugeTanah from "@/components/widget.gauge-tanah"
import { ChartGraph, WidgetLineChartTimeTanah } from "@/components/widget.line-chart-tanah"
import { reverse } from "dns"
import { fase_pertumbuhan, options_lahan } from "@/config/helpers"

const MySwal=withReactContent(swal)


export default function Page(props) {

    const lahan_id=props.lahan_id


    //DATA/MUTATION
    const get_lahan=useQuery({
        queryKey:["get_lahan", lahan_id],
        queryFn:async()=>lahan_request.get(lahan_id),
        initialData:{
            data:{}
        },
        refetchOnWindowFocus:false,
        refetchOnReconnect:false,
        enabled:lahan_id!=""
    })

    //ACTIONS

    return (
        <>
            <Head>
                <title>Infografis</title>
            </Head>
            <SidebarProvider>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
                        <div className="flex items-center gap-2 px-5">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <h1 className="text-base font-medium">Infografis</h1>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-5 px-6 pt-0 mt-6">
                        <div className="flex items-center w-full md:max-w-[250px] z-50 mb-10">
                            <ReactSelect
                                options={options_lahan(props.lahan)}
                                value={options_lahan(props.lahan).find(f=>f.value==props.lahan_id)}
                                onChange={e=>{
                                    if(e.value==""){
                                        router.visit("/", {fresh:true})
                                    }
                                    else{
                                    router.visit(`/?lahan_id=${e.value}`, {fresh:true})
                                    }
                                }}
                                className="grow mr-1"
                            />
                        </div>

                        <div className="relative overflow-hidden flex min-h-80 bg-emerald-100 dark:bg-emerald-900 rounded-xl mb-3">
                            <div className="relative z-10 flex flex-col justify-between w-full lg:w-1/2 p-5">
                                <h2 className="flex grow items-center text-4xl font-bold">{get_lahan?.data?.data.nama_lahan}</h2>
                                {!_.isUndefined(get_lahan?.data?.data.id)&&
                                    <div className="flex flex-col mt-4 text-[15px]">
                                        <div className="flex">
                                            <span className="text-muted-foreground w-[150px] mb-0.5">Lokasi </span>
                                            <span className="grow">: &nbsp; {get_lahan?.data?.data.lokasi}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-muted-foreground w-[150px] mb-0.5">Pemilik </span>
                                            <span className="grow">: &nbsp; {get_lahan?.data?.data.pemilik}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-muted-foreground w-[150px] mb-0.5">Luas Area </span>
                                            <span className="grow">: &nbsp; {get_lahan?.data?.data.luas_area} m<sup>2</sup></span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-muted-foreground w-[150px] mb-0.5">Jarak Tanam </span>
                                            <span className="grow">: &nbsp; {get_lahan?.data?.data.jarak_tanam}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-muted-foreground w-[150px] mb-0.5">Jumlah Tanaman </span>
                                            <span className="grow">: &nbsp; {get_lahan?.data?.data.jumlah_tanaman} pohon</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-muted-foreground w-[150px] mb-0.5">Tanggal Tanam </span>
                                            <span className="grow">: &nbsp; {format(get_lahan?.data?.data.tgl_tanam, "dd/MM/yyyy")}</span>
                                        </div>
                                    </div>
                                }
                                <div className="flex mt-5">
                                    <button className="flex items-center justify-center w-10 h-10 rounded-full">
                                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="text-lg" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                    </button>
                                    <button className="flex items-center justify-center w-10 h-10 bg-white dark:bg-accent rounded-full ml-2">
                                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="text-lg" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </button>
                                </div>
                            </div>
                            <img src="/images/banner-2.png" className="absolute right-0 w-auto h-[350px]"/>
                        </div>

                        <ControlBox />

                        <LineChart />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}

const LineChart=(props)=>{

    const lahan_id=usePage().props.lahan_id
    const date=addDays(new Date(), -5)

    const [filter, setFilter]=useState({
        lahan_id:lahan_id,
        type:"weekly",
        date_start:format(date, "yyyy-MM-dd"),
        date_end:format(addDays(date, 7), "yyyy-MM-dd")
    })

    //QUERY/MUTATION
    const gets_lahan_detail_chart=useQuery({
        queryKey:["gets_lahan_detail_chart", filter],
        queryFn:async()=>lahan_detail_request.gets(filter),
        initialData:{
            data:[],
            last_page:0,
            first_page:1,
            current_page:1,
            total:0
        },
        refetchOnWindowFocus:false,
        refetchOnReconnect:false,
        enabled:lahan_id!=""
    })
    
    //VALUES
    const options_type=[
        {label:"Mingguan", value:"weekly"},
        {label:"Harian", value:"daily"}
    ]
    const generate_labels=(date_start, date_end)=>{
        let labels=[]
        let up_date=date_start

        while(up_date!=date_end){
            labels=labels.concat([format(up_date, "yyyy-MM-dd")])
            up_date=format(addDays(up_date, 1), "yyyy-MM-dd")
        }

        return labels.concat([date_end])
    }
    const generate_datasets=(type, data)=>{
        const reverse_data=[...data].reverse()
        const data_aktual=reverse_data.map(item=>{
            const date=new Date(item.created_at)

            return {
                x:new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()),
                y:item[type]
            }
        })

        let data_ideal=[]
        if(type=="soil_n"){
            data_ideal=reverse_data.map(item=>{
                const date=new Date(item.created_at)

                return {
                    x:new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()),
                    y:fase_pertumbuhan(item).ideal_n
                }
            })
        }
        else if(type=="soil_p"){
            data_ideal=reverse_data.map(item=>{
                const date=new Date(item.created_at)

                return {
                    x:new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()),
                    y:fase_pertumbuhan(item).ideal_p
                }
            })
        }
        else if(type=="soil_k"){
            data_ideal=reverse_data.map(item=>{
                const date=new Date(item.created_at)

                return {
                    x:new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()),
                    y:fase_pertumbuhan(item).ideal_k
                }
            })
        }

        return {
            data_aktual,
            data_ideal
        }
    }
    const data_loaded=(!gets_lahan_detail_chart.isError&&!gets_lahan_detail_chart.isFetching&&gets_lahan_detail_chart.isFetched)?gets_lahan_detail_chart.data.data:[]


    return (
        <div className="flex flex-wrap -mx-3 mb-3">
            <div className="flex mb-3 mt-8 px-3">
                <div className="w-full lg:w-[150px]">
                    <ReactSelect
                        options={options_type}
                        value={options_type.find(f=>f.value==filter.type)}
                        onChange={e=>{
                            console.log(e.value)
                            switch(e.value){
                                case "weekly":
                                    setFilter(
                                        Object.assign({}, filter, {
                                            type:"weekly",
                                            date_start:format(filter.date_start, "yyyy-MM-dd"),
                                            date_end:format(addDays(filter.date_start, 7), "yyyy-MM-dd")
                                        })
                                    )
                                break;
                                case "daily":
                                    setFilter(
                                        Object.assign({}, filter, {
                                            type:"daily",
                                            date_start:format(filter.date_start, "yyyy-MM-dd"),
                                            date_end:format(addDays(filter.date_start, 1), "yyyy-MM-dd")
                                        })
                                    )
                                break;
                            }
                        }}
                    />
                </div>
                <div className="flex lg:max-w-[300px] ml-4">
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="size-9"
                        onClick={e=>{
                            const new_date_start=format(addDays(filter.date_start, -1), "yyyy-MM-dd")

                            switch(filter.type){
                                case "weekly":
                                    setFilter(
                                        Object.assign({}, filter, {
                                            date_start:format(new_date_start, "yyyy-MM-dd"),
                                            date_end:format(addDays(new_date_start, 7), "yyyy-MM-dd")
                                        })
                                    )
                                break;
                                case "daily":
                                    setFilter(
                                        Object.assign({}, filter, {
                                            date_start:format(new_date_start, "yyyy-MM-dd"),
                                            date_end:format(addDays(new_date_start, 1), "yyyy-MM-dd")
                                        })
                                    )
                                break;
                            }
                        }}
                    >
                        <ChevronLeftIcon />
                    </Button>
                    <DatePicker
                        className="col-span-3 w-full mx-1"
                        date={new Date(filter.date_start)}
                        setDate={(date)=>{
                            switch(filter.type){
                                case "weekly":
                                    setFilter(
                                        Object.assign({}, filter, {
                                            date_start:format(date, "yyyy-MM-dd"),
                                            date_end:format(addDays(date, 7), "yyyy-MM-dd")
                                        })
                                    )
                                break;
                                case "daily":
                                    setFilter(
                                        Object.assign({}, filter, {
                                            date_start:format(date, "yyyy-MM-dd"),
                                            date_end:format(addDays(date, 1), "yyyy-MM-dd")
                                        })
                                    )
                                break;
                            }
                            
                        }}
                        placeholder="Pilih tanggal"
                    />
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="size-9"
                        onClick={e=>{
                            const new_date_start=format(addDays(filter.date_start, 1), "yyyy-MM-dd")

                            switch(filter.type){
                                case "weekly":
                                    setFilter(
                                        Object.assign({}, filter, {
                                            date_start:format(new_date_start, "yyyy-MM-dd"),
                                            date_end:format(addDays(new_date_start, 7), "yyyy-MM-dd")
                                        })
                                    )
                                break;
                                case "daily":
                                    setFilter(
                                        Object.assign({}, filter, {
                                            date_start:format(new_date_start, "yyyy-MM-dd"),
                                            date_end:format(addDays(new_date_start, 1), "yyyy-MM-dd")
                                        })
                                    )
                                break;
                            }
                        }}
                    >
                        <ChevronRightIcon />
                    </Button>
                </div>
            </div>

            <WidgetLineChartTimeTanah
                title="Soil Nitrogen"
                isHour={filter.type=="daily"}
                labels={generate_labels(filter.date_start, filter.date_end)}
                datasets={[
                    {
                        label: 'Data Aktual',
                        data: generate_datasets("soil_n", data_loaded).data_aktual,
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
                        data: generate_datasets("soil_n", data_loaded).data_ideal,
                        borderColor: 'rgb(35, 143, 250)',
                        backgroundColor: 'rgba(35, 143, 250, 0.1)',
                        borderWidth:1,
                        pointBorderWidth:0,
                        pointRadius:1,
                        tension:.2,
                        fill:true
                    }
                ]}
            />

            <WidgetLineChartTimeTanah
                title="Soil Phosphor"
                isHour={filter.type=="daily"}
                labels={generate_labels(filter.date_start, filter.date_end)}
                datasets={[
                    {
                        label: 'Data Aktual',
                        data: generate_datasets("soil_p", data_loaded).data_aktual,
                        borderColor: 'rgb(252, 102, 51)',
                        backgroundColor: 'rgb(252, 102, 51, 0.4)',
                        borderWidth:1,
                        pointBorderWidth:0,
                        pointRadius:1,
                        tension:.2,
                        fill:true
                    },
                    {
                        label: 'Data Ideal',
                        data: generate_datasets("soil_p", data_loaded).data_ideal,
                        borderColor: 'rgb(252, 102, 51)',
                        backgroundColor: 'rgb(252, 102, 51, 0.1)',
                        borderWidth:1,
                        pointBorderWidth:0,
                        pointRadius:1,
                        tension:.2,
                        fill:true
                    }
                ]}
            />

            <WidgetLineChartTimeTanah
                title="Soil Kalium"
                isHour={filter.type=="daily"}
                labels={generate_labels(filter.date_start, filter.date_end)}
                datasets={[
                    {
                        label: 'Data Aktual',
                        data: generate_datasets("soil_k", data_loaded).data_aktual,
                        borderColor: 'rgb(40, 252, 102)',
                        backgroundColor: 'rgb(40, 252, 102, 0.4)',
                        borderWidth:1,
                        pointBorderWidth:0,
                        pointRadius:1,
                        tension:.2,
                        fill:true
                    },
                    {
                        label: 'Data Ideal',
                        data: generate_datasets("soil_k", data_loaded).data_ideal,
                        borderColor: 'rgb(40, 252, 102)',
                        backgroundColor: 'rgb(40, 252, 102, 0.1)',
                        borderWidth:1,
                        pointBorderWidth:0,
                        pointRadius:1,
                        tension:.2,
                        fill:true
                    }
                ]}
            />

            <WidgetLineChartTimeTanah
                title="pH Tanah"
                isHour={filter.type=="daily"}
                labels={generate_labels(filter.date_start, filter.date_end)}
                datasets={[
                    {
                        label: 'Data Aktual',
                        data: generate_datasets("soil_ph", data_loaded).data_aktual,
                        borderColor: 'rgb(74, 85, 101)',
                        backgroundColor: 'rgba(74, 85, 101, 0.2)',
                        borderWidth:1,
                        pointBorderWidth:0,
                        pointRadius:1,
                        tension:.2,
                        fill:true
                    }
                ]}
            />

            <WidgetLineChartTimeTanah
                title="CEC"
                isHour={filter.type=="daily"}
                labels={generate_labels(filter.date_start, filter.date_end)}
                datasets={[
                    {
                        label: 'Data Aktual',
                        data: generate_datasets("cec", data_loaded).data_aktual,
                        borderColor: 'rgb(74, 85, 101)',
                        backgroundColor: 'rgba(74, 85, 101, 0.2)',
                        borderWidth:1,
                        pointBorderWidth:0,
                        pointRadius:1,
                        tension:.2,
                        fill:true
                    }
                ]}
            />

            <WidgetLineChartTimeTanah
                title="Electrical Conductivity"
                isHour={filter.type=="daily"}
                labels={generate_labels(filter.date_start, filter.date_end)}
                datasets={[
                    {
                        label: 'Data Aktual',
                        data: generate_datasets("soil_ec", data_loaded).data_aktual,
                        borderColor: 'rgb(74, 85, 101)',
                        backgroundColor: 'rgba(74, 85, 101, 0.2)',
                        borderWidth:1,
                        pointBorderWidth:0,
                        pointRadius:1,
                        tension:.2,
                        fill:true
                    }
                ]}
            />

            <WidgetLineChartTimeTanah
                title="Salinity"
                isHour={filter.type=="daily"}
                labels={generate_labels(filter.date_start, filter.date_end)}
                datasets={[
                    {
                        label: 'Data Aktual',
                        data: generate_datasets("soil_s", data_loaded).data_aktual,
                        borderColor: 'rgb(74, 85, 101)',
                        backgroundColor: 'rgba(74, 85, 101, 0.2)',
                        borderWidth:1,
                        pointBorderWidth:0,
                        pointRadius:1,
                        tension:.2,
                        fill:true
                    }
                ]}
            />

            <WidgetLineChartTimeTanah
                title="Soil TDS"
                isHour={filter.type=="daily"}
                labels={generate_labels(filter.date_start, filter.date_end)}
                datasets={[
                    {
                        label: 'Data Aktual',
                        data: generate_datasets("soil_tds", data_loaded).data_aktual,
                        borderColor: 'rgb(74, 85, 101)',
                        backgroundColor: 'rgba(74, 85, 101, 0.2)',
                        borderWidth:1,
                        pointBorderWidth:0,
                        pointRadius:1,
                        tension:.2,
                        fill:true
                    }
                ]}
            />

            <WidgetLineChartTimeTanah
                title="Humidity"
                isHour={filter.type=="daily"}
                labels={generate_labels(filter.date_start, filter.date_end)}
                datasets={[
                    {
                        label: 'Data Aktual',
                        data: generate_datasets("soil_h", data_loaded).data_aktual,
                        borderColor: 'rgb(74, 85, 101)',
                        backgroundColor: 'rgba(74, 85, 101, 0.2)',
                        borderWidth:1,
                        pointBorderWidth:0,
                        pointRadius:1,
                        tension:.2,
                        fill:true
                    }
                ]}
            />

            <WidgetLineChartTimeTanah
                title="Temperature"
                isHour={filter.type=="daily"}
                labels={generate_labels(filter.date_start, filter.date_end)}
                datasets={[
                    {
                        label: 'Data Aktual',
                        data: generate_datasets("soil_t", data_loaded).data_aktual,
                        borderColor: 'rgb(74, 85, 101)',
                        backgroundColor: 'rgba(74, 85, 101, 0.2)',
                        borderWidth:1,
                        pointBorderWidth:0,
                        pointRadius:1,
                        tension:.2,
                        fill:true
                    }
                ]}
            />
        </div>
    )
}

const ControlBox=(props)=>{
    const lahan_id=usePage().props.lahan_id
    const filter={lahan_id:lahan_id, status:"connected"}

    //QUERY/MUTATION
    const gets_lahan_detail_last_data=useQuery({
        queryKey:["gets_lahan_detail_last_data", filter],
        queryFn:async()=>lahan_detail_request.get_last(filter),
        initialData:{
            data:{}
        },
        refetchOnWindowFocus:false,
        refetchOnReconnect:false,
        enabled:lahan_id!=""
    })

    //VALUES
    const soil_data=(type)=>{
        let min, max

        switch(type){
            case "soil_h":
                min=40, max=80
            break;
            case "soil_t":
                min=20, max=35
            break;
            case "soil_ec":
                min=1, max=4
            break;
            case "soil_ph":
                min=1, max=14
            break;
            case "soil_n":
                min=0.1, max=0.75
            break;
            case "soil_p":
                min=15, max=60
            break;
            case "soil_k":
                min=0.1, max=1
            break;
            case "cec":
                min=5, max=40
        }

        const pembagi=max-min
        const nilai=Math.max(0, last_data[type]-min)
        const percent=Math.min(1, nilai/pembagi)

        let color
        if(percent<0.25){
            color="green"
        }
        else if(percent<0.5){
            color="green1"
        }
        else if(percent<0.75){
            color="yellow"
        }
        else if(percent<=1){
            color="red"
        }

        return {
            type:type,
            color:color,
            percent:percent,
            value:last_data[type]
        }
    }
    const last_data=(!gets_lahan_detail_last_data.isError&&!gets_lahan_detail_last_data.isFetching)?gets_lahan_detail_last_data.data.data:null

    return (
        <div className="flex flex-wrap -mx-3 mb-3">
            {(!_.isNull(last_data)&&lahan_id!="")&&
                <>
                    <WidgetGaugeTanah
                        data={soil_data("soil_h")}
                        title="Soil Huminity"
                    />
                    <WidgetGaugeTanah
                        data={soil_data("soil_t")}
                        title="Soil Temperature"
                    />
                    <WidgetGaugeTanah
                        data={soil_data("soil_ec")}
                        title="Soil Conductivity"
                    />
                    <WidgetGaugeTanah
                        data={soil_data("soil_ph")}
                        title="Soil pH"
                    />
                    <WidgetGaugeTanah
                        data={soil_data("soil_n")}
                        title="Soil Nitrogen"
                    />
                    <WidgetGaugeTanah
                        data={soil_data("soil_p")}
                        title="Soil Phosphor"
                    />
                    <WidgetGaugeTanah
                        data={soil_data("soil_k")}
                        title="Soil Kalium"
                    />
                </>
            }
        </div>
    )
}

