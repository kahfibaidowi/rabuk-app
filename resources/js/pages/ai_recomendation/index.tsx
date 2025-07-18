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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button, buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {Select as ReactSelect} from "@/components/select-form"
import { ArrowRight, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Edit2, Ellipsis, Filter, LampWallUp, Plus, PlusIcon, Trash2, XCircle } from "lucide-react"
import { NumericFormat } from 'react-number-format'

import { toast } from "sonner"
import axios from "axios"
import { useState } from "react"
import * as yup from "yup"
import { Formik } from 'formik'
import { lahan_detail_request, lahan_request, modbus_sensor_request, pupuk_request } from "@/config/request"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Head, Link, router, usePage } from "@inertiajs/react"
import { queryClient } from '@/Config/query_client'
import { DatePicker } from "@/components/datepicker"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import WidgetTanaman from "@/components/widget.tanaman"
import TanamanPagination from "@/components/widget.tanaman-pagination"
import swal from "sweetalert2"
import withReactContent from 'sweetalert2-react-content'
import TablePagination from "@/components/widget.table-pagination"
import _ from "underscore"
import WidgetGaugeTanah from "@/components/widget.gauge-tanah"
import WidgetLineChartTanah from "@/components/widget.line-chart-tanah"
import { reverse } from "dns"
import { countMonth, data_fase, fase_pertumbuhan, options_lahan } from "@/config/helpers"
import { Checkbox } from "@/components/ui/checkbox"

const MySwal=withReactContent(swal)


export default function Page(props) {

    const lahan_id=props.lahan_id
    const [filter_pupuk, setFilterPupuk]=useState({
        per_page:15,
        last_page:0,
        page:1,
        lahan_id:lahan_id,
        refetch:0
    })
    const filter_last={lahan_id:lahan_id, status:"connected"}


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
    const gets_pupuk_lahan=useQuery({
        queryKey:["gets_pupuk_lahan", filter_pupuk],
        queryFn:async()=>pupuk_request.gets(filter_pupuk),
        initialData:{
            data:[],
            last_page:0,
            first_page:1,
            current_page:1,
            total:0
        },
        refetchOnWindowFocus:false,
        refetchOnReconnect:false,
        enabled:filter_pupuk.lahan_id!=""
    })
    const get_lahan_detail_last_data=useQuery({
        queryKey:["get_lahan_detail_last_data", filter_last],
        queryFn:async()=>lahan_detail_request.get_last(filter_last),
        initialData:{
            data:{}
        },
        refetchOnWindowFocus:false,
        refetchOnReconnect:false,
        enabled:lahan_id!=""
    })
    const last_data=(!get_lahan_detail_last_data.isError&&!get_lahan_detail_last_data.isFetching&&get_lahan_detail_last_data.isFetched)?get_lahan_detail_last_data.data.data:null

    //ACTIONS

    return (
        <>
            <Head>
                <title>AI Recomendation</title>
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
                                        router.visit("/ai_recomendation", {fresh:true})
                                    }
                                    else{
                                    router.visit(`/ai_recomendation?lahan_id=${e.value}`, {fresh:true})
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
                        
                        <KondisiTanaman
                            last_data={last_data}
                        />

                        <div className="mb-5 rounded-2xl overflow-hidden">
                            <img src="/images/banner-1.png"/>
                        </div>

                        <KondisiUnsurHara
                            last_data={last_data}
                        />

                        <KondisiTanahDanIklim
                            last_data={last_data}
                        />

                        <DosisPupukPerTanaman
                            lahan={get_lahan}
                            last_data={last_data}
                            filter={filter_pupuk}
                            setFilter={setFilterPupuk}
                        />

                        <DataPupuk
                            dataSource={gets_pupuk_lahan}
                            filter={filter_pupuk}
                            setFilter={setFilterPupuk}
                        />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}

const KondisiTanaman=({last_data})=>{

    const value_fase=()=>{
        if(!_.isNull(last_data)) return fase_pertumbuhan(last_data).fase
        return ""
    }
    
    return (
        <Card className="mb-5">
            <CardHeader>
                <CardTitle>Kondisi Tanaman</CardTitle>
                <CardDescription>Fase pertumbuhan tanaman dalam bulan</CardDescription>
            </CardHeader>
            <CardContent className="">
                <div className="-mx-3 flex flex-col sm:flex-row flex-wrap">
                    <div className="w-full md:w-1/4 px-3 mb-10 md:mb-0">
                        <div className="flex flex-col rounded-2xl bg-emerald-100 dark:bg-emerald-900 p-5 h-full">
                            <span className="text-sm">Fase Pertumbuhan</span>
                            <div className="flex items-center justify-center mt-5">
                                <img src="/images/icon-4.png" className="max-w-1/4 mr-5"/>
                                <div className='flex flex-col items-center justify-center w-36 h-20 bg-emerald-600 text-white rounded-2xl'>
                                    <span className=''>{value_fase()!=""?value_fase():"belum ada data"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-3/4 px-3 mb-10 md:mb-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">Fase</TableHead>
                                    <TableHead className="w-[100px]">N(%)</TableHead>
                                    <TableHead className="w-[100px]">P(Ppm)</TableHead>
                                    <TableHead className="w-[100px]">K(Me/100g)</TableHead>
                                    <TableHead className="">Rasio Ideal N:P:K</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data_fase.map(fase=>(
                                    <TableRow className={cn({"!bg-emerald-700 text-white":fase.fase==value_fase()})}>
                                        <TableCell className="font-medium">{fase.fase}</TableCell>
                                        <TableCell>{fase.ideal_n}</TableCell>
                                        <TableCell>{fase.ideal_p}</TableCell>
                                        <TableCell>{fase.ideal_k}</TableCell>
                                        <TableCell className="">{fase.rasio_n}:{fase.rasio_p}:{fase.rasio_k}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const KondisiUnsurHara=({last_data})=>{

    const skn=(item)=>{
        const fase=fase_pertumbuhan(item)

        return fase?.ideal_n-item.soil_n
    }
    const skp=(item)=>{
        const fase=fase_pertumbuhan(item)

        return fase?.ideal_p-item.soil_p
    }
    const skk=(item)=>{
        const fase=fase_pertumbuhan(item)

        return fase?.ideal_k-item.soil_k
    }

    return (
        <Card className="mb-5">
            <CardHeader>
                <CardTitle>Kondisi Unsur Hara Saat Ini</CardTitle>
            </CardHeader>
            <CardContent className="-mt-4">
                {!_.isNull(last_data)?
                    <div className="-mx-3 flex flex-col sm:flex-row flex-wrap">
                        <div className="w-full sm:w-1/2 xl:w-1/3 px-3 mt-10">
                            <div className="rounded-2xl bg-yellow-100 p-5">
                                <div className="flex items-center justify-between -mt-12">
                                    <div
                                        className={cn('flex flex-col items-center justify-center px-6 py-2 w-24 lg:w-36 text-white rounded-2xl bg-yellow-600', {
                                            "bg-red-600":skn(last_data)>0
                                        })}
                                    >
                                        <span className='text-xl font-bold text-center'>
                                            {skn(last_data)>0?"Kekurangan":"Kelebihan"} {Math.abs(skn(last_data))}
                                        </span>
                                    </div>
                                    <div className="w-36 h-36 bg-white dark:bg-accent rounded-full shadow-lg px-5 flex items-center">
                                        <img src="/images/icon-n.png"/>
                                    </div>
                                </div>
                                <div className="mt-10 bg-white dark:bg-accent rounded-2xl px-6 py-3 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold text-center py-1">Nitrogen (N)</span>
                                    <div className="w-full border-b dark:border-gray-500 mt-2"></div>
                                    <div className="mt-5">Kekurangan N = <strong>{Math.max(0, skn(last_data))}</strong></div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full sm:w-1/2 xl:w-1/3 px-3 mt-10">
                            <div className="rounded-2xl bg-yellow-100 p-5">
                                <div className="flex items-center justify-between -mt-12">
                                    <div 
                                        className={cn('flex flex-col items-center justify-center px-6 py-2 w-24 lg:w-36 text-white rounded-2xl bg-yellow-600', {
                                            "bg-red-600":skp(last_data)>0
                                        })}
                                    >
                                        <span className='text-xl font-bold text-center'>
                                            {skp(last_data)>0?"Kekurangan":"Kelebihan"} {Math.abs(skp(last_data))}
                                        </span>
                                    </div>
                                    <div className="w-36 h-36 bg-white dark:bg-accent rounded-full shadow-lg px-5 flex items-center">
                                        <img src="/images/icon-p.png"/>
                                    </div>
                                </div>
                                <div className="mt-10 bg-white dark:bg-accent rounded-2xl px-6 py-3 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold text-center py-1">Fosfor (P)</span>
                                    <div className="w-full border-b dark:border-gray-500 mt-2"></div>
                                    <div className="mt-5">Kekurangan P = <strong>{Math.max(0, skp(last_data))}</strong></div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full sm:w-1/2 xl:w-1/3 px-3 mt-10">
                            <div className="rounded-2xl bg-yellow-100 p-5">
                                <div className="flex items-center justify-between -mt-12">
                                    <div
                                        className={cn('flex flex-col items-center justify-center px-6 py-2 w-24 lg:w-36 text-white rounded-2xl bg-yellow-600', {
                                            "bg-red-600":skk(last_data)>0
                                        })}
                                    >
                                        <span className='text-xl font-bold text-center'>
                                            {skk(last_data)>0?"Kekurangan":"Kelebihan"} {Math.abs(skk(last_data))}
                                        </span>
                                    </div>
                                    <div className="w-36 h-36 bg-white dark:bg-accent rounded-full shadow-lg px-5 flex items-center">
                                        <img src="/images/icon-k.png"/>
                                    </div>
                                </div>
                                <div className="mt-10 bg-white dark:bg-accent rounded-2xl px-6 py-3 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold text-center py-1">Kalium (K)</span>
                                    <div className="w-full border-b dark:border-gray-500 mt-2"></div>
                                    <div className="mt-5">Kekurangan K = <strong>{Math.max(0, skk(last_data))}</strong></div>
                                </div>
                            </div>
                        </div>
                    </div>
                :
                    <div className="w-full text-center text-muted-foreground">belum ada data</div>
                }
            </CardContent>
        </Card>
    )
}

const KondisiTanahDanIklim=({last_data})=>{
    const kondisi_ph=()=>{
        const item=last_data
        
        //pH
        let korektif="kondisi baik"
        if(item.soil_ph<5.5){
            korektif="tambahkan dolomit 1-2 ton/ha"
        }
        else if(item.soil_ph>7.5){
            korektif="Hindari pupuk basa, gunakan pupuk fosfat asam"
        }

        return korektif
    }
    const kondisi_ec=()=>{
        const item=last_data
        
        //EC
        let korektif="kondisi baik"
        if(item.soil_ec>2){
            korektif="kurangi dosis pupuk, tambahkan kompos atau humus"
        }

        return korektif
    }
    const kondisi_tds=()=>{
        const item=last_data
        
        //EC
        let korektif="kondisi baik"
        if(item.soil_tds>1000){
            korektif="kurangi dosis pupuk, tambahkan kompos atau humus"
        }

        return korektif
    }
    const kondisi_h=()=>{
        const item=last_data
        
        //CH
        let korektif="kondisi baik"
        if(item.soil_h<30){
            korektif="Tunda pemupukan, lakukan irigasi terlebih dahulu"
        }

        return korektif
    }
    const kondisi_t=()=>{
        const item=last_data
        
        //CH
        let korektif="kondisi baik"
        if(item.soil_t>35){
            korektif="Hindari pemupukan di siang hari"
        }

        return korektif
    }
    const kondisi_ch=()=>{
        const item=last_data
        
        //CH
        let korektif="kondisi baik"
        if(item.curah_hujan>100){
            korektif="kurangi dosis urea, bagi dosis menjadi 2x aplikasi"
        }
        else if(item.curah_hujan<20){
            korektif="perbanyak irigasi, hindari pemupukan pada siang hari"
        }

        return korektif
    }

    return (
        <Card className="mb-5">
            <CardHeader>
                <CardTitle>Koreksi berdasarkan Kondisi Tanah dan Iklim</CardTitle>
            </CardHeader>
            <CardContent className="-mt-4">
                {!_.isNull(last_data)?
                    <div className="-mx-3 flex flex-col sm:flex-row flex-wrap">
                        <div className="w-full sm:w-1/2 xl:w-1/3 px-3 mt-10">
                            <div className="rounded-2xl bg-emerald-200 p-5">
                                <div className="flex items-center justify-between -mt-12">
                                    <div className='flex flex-col items-center justify-center px-6 py-2 w-24 lg:w-36 bg-emerald-600 text-white rounded-2xl'>
                                        <span className='text-xl font-bold'>{last_data.soil_ph}</span>
                                    </div>
                                    <div className="w-36 h-36 bg-white dark:bg-accent rounded-full shadow-lg px-2">
                                        <img src="/images/icon-3.png"/>
                                    </div>
                                </div>
                                <div className="mt-10 bg-white dark:bg-accent rounded-2xl px-6 py-3 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold text-center py-1">pH Tanah</span>
                                    <div className="w-full border-b dark:border-gray-500 mt-2"></div>
                                    <div className="mt-5">
                                        {kondisi_ph()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full sm:w-1/2 xl:w-1/3 px-3 mt-10">
                            <div className="rounded-2xl bg-yellow-100 p-5">
                                <div className="flex items-center justify-between -mt-12">
                                    <div className='flex flex-col items-center justify-center px-6 py-2 w-24 lg:w-36 bg-yellow-600 text-white rounded-2xl'>
                                        <span className='text-xl font-bold'>{last_data.soil_ec} dS/m</span>
                                    </div>
                                    <div className="w-36 h-36 bg-white dark:bg-accent rounded-full shadow-lg px-2">
                                        <img src="/images/icon-1.png"/>
                                    </div>
                                </div>
                                <div className="mt-10 bg-white dark:bg-accent rounded-2xl px-6 py-3 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold text-center py-1">Soil EC</span>
                                    <div className="w-full border-b dark:border-gray-500 mt-2"></div>
                                    <div className="mt-5">
                                        {kondisi_ec()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full sm:w-1/2 xl:w-1/3 px-3 mt-10">
                            <div className="rounded-2xl bg-blue-200 p-5">
                                <div className="flex items-center justify-between -mt-12">
                                    <div className='flex flex-col items-center justify-center px-6 py-2 w-24 lg:w-36 bg-blue-600 text-white rounded-2xl'>
                                        <span className='text-xl font-bold'>{last_data.curah_hujan} mm/minggu</span>
                                    </div>
                                    <div className="w-36 h-36 bg-white dark:bg-accent rounded-full shadow-lg px-2">
                                        <img src="/images/icon-2.png"/>
                                    </div>
                                </div>
                                <div className="mt-10 bg-white dark:bg-accent rounded-2xl px-6 py-3 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold text-center py-1">Curah Hujan</span>
                                    <div className="w-full border-b dark:border-gray-500 mt-2"></div>
                                    <div className="mt-5">
                                        {kondisi_ch()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full sm:w-1/2 xl:w-1/3 px-3 mt-10">
                            <div className="rounded-2xl bg-gray-200 p-5">
                                <div className="flex items-center justify-between -mt-12">
                                    <div className='flex flex-col items-center justify-center px-6 py-2 w-24 lg:w-36 bg-gray-600 text-white rounded-2xl'>
                                        <span className='text-xl font-bold'>{last_data.soil_tds} ppm</span>
                                    </div>
                                    <div className="w-36 h-36 flex items-center justify-center bg-white dark:bg-accent rounded-full shadow-lg px-2">
                                        <span className="font-bold text-2xl">TDS</span>
                                    </div>
                                </div>
                                <div className="mt-10 bg-white dark:bg-accent rounded-2xl px-6 py-3 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold text-center py-1">TDS</span>
                                    <div className="w-full border-b dark:border-gray-500 mt-2"></div>
                                    <div className="mt-5">
                                        {kondisi_tds()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full sm:w-1/2 xl:w-1/3 px-3 mt-10">
                            <div className="rounded-2xl bg-gray-200 p-5">
                                <div className="flex items-center justify-between -mt-12">
                                    <div className='flex flex-col items-center justify-center px-6 py-2 w-24 lg:w-36 bg-gray-600 text-white rounded-2xl'>
                                        <span className='text-xl font-bold'>{last_data.soil_h}%</span>
                                    </div>
                                    <div className="w-36 h-36 flex items-center justify-center bg-white dark:bg-accent rounded-full shadow-lg px-2">
                                        <span className="font-bold text-2xl">H</span>
                                    </div>
                                </div>
                                <div className="mt-10 bg-white dark:bg-accent rounded-2xl px-6 py-3 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold text-center py-1">Humidity</span>
                                    <div className="w-full border-b dark:border-gray-500 mt-2"></div>
                                    <div className="mt-5">
                                        {kondisi_h()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full sm:w-1/2 xl:w-1/3 px-3 mt-10">
                            <div className="rounded-2xl bg-gray-200 p-5">
                                <div className="flex items-center justify-between -mt-12">
                                    <div className='flex flex-col items-center justify-center px-6 py-2 w-24 lg:w-36 bg-gray-600 text-white rounded-2xl'>
                                        <span className='text-xl font-bold'>{last_data.soil_t} &#8451;</span>
                                    </div>
                                    <div className="w-36 h-36 flex items-center justify-center bg-white dark:bg-accent rounded-full shadow-lg px-2">
                                        <span className="font-bold text-2xl">T</span>
                                    </div>
                                </div>
                                <div className="mt-10 bg-white dark:bg-accent rounded-2xl px-6 py-3 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold text-center py-1">Temperature</span>
                                    <div className="w-full border-b dark:border-gray-500 mt-2"></div>
                                    <div className="mt-5">
                                        {kondisi_t()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                :
                    <div className="w-full text-center text-muted-foreground">belum ada data</div>
                }
            </CardContent>
        </Card>
    )
}

const DosisPupukPerTanaman=({last_data, lahan, setFilter, filter})=>{

    const lahan_id=usePage().props.lahan_id
    const [openModal, setOpenModal]=useState(false)

    //DATA/MUTATION
    const tambah_data=useMutation({
        mutationFn:params=>pupuk_request.add(params),
        onSuccess:data=>{
            setFilter(
                Object.assign({}, filter, {
                    refetch:filter.refetch+1
                })
            )
            setOpenModal(false)
        },
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Insert Data Failed! ", {position:"bottom-center"})
        }
    })

    //VALUES
    const skn=(item)=>{
        const fase=fase_pertumbuhan(item)

        return fase?.ideal_n-item.soil_n
    }
    const skp=(item)=>{
        const fase=fase_pertumbuhan(item)

        return fase?.ideal_p-item.soil_p
    }
    const skk=(item)=>{
        const fase=fase_pertumbuhan(item)

        return fase?.ideal_k-item.soil_k
    }
    const dosis_urea=(item)=>{
        return Math.max(0, (skn(item)*100)/46)
    }
    const dosis_sp36=(item)=>{
        return Math.max(0, (skp(item)*100)/16)
    }
    const dosis_kcl=(item)=>{
        return Math.max(0, (skk(item)*100)/50)
    }

    
    return (
        <>
            <Card className="mb-5">
                <CardHeader>
                    <CardTitle>Dosis Pupuk per Tanaman (gram)</CardTitle>
                </CardHeader>
                <CardContent className="-mt-4">
                    {!_.isNull(last_data)?
                        <div className="flex flex-col">
                            <div className="-mx-3 flex flex-col sm:flex-row flex-wrap">
                                <div className="w-full md:w-1/2 xl:w-1/3 px-3 mt-10">
                                    <div className="rounded-2xl bg-yellow-100 p-5">
                                        <div className="flex flex-col items-center justify-center -mt-12">
                                            <div className="w-36 h-36 bg-white dark:bg-accent rounded-full shadow-lg px-2 flex items-center justify-center">
                                                <span className="text-center text-xl font-bold">
                                                    {dosis_urea(last_data)}<br/>gram
                                                </span>
                                            </div>
                                            <span className="text-xl font-bold mt-5 text-gray-800">Urea</span>
                                        </div>
                                        <div className="mt-5 bg-white dark:bg-accent rounded-2xl px-6 py-3 flex flex-col items-center justify-center">
                                            <div className="text-center">
                                                Kandungan Pupuk<br/>
                                                <strong>46% N</strong>
                                            </div>
                                            <div className="w-full border-b dark:border-gray-500 mt-2"></div>
                                            <div className="mt-5">Dosis Pupuk Urea = <strong>{dosis_urea(last_data)} gram</strong> per tanaman</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 xl:w-1/3 px-3 mt-10">
                                    <div className="rounded-2xl bg-yellow-100 p-5">
                                        <div className="flex flex-col items-center justify-center -mt-12">
                                            <div className="w-36 h-36 bg-white dark:bg-accent rounded-full shadow-lg px-2 flex items-center justify-center">
                                                <span className="text-center text-xl font-bold">
                                                    {dosis_sp36(last_data)}<br/>gram
                                                </span>
                                            </div>
                                            <span className="text-xl font-bold mt-5 text-gray-800">SP-36</span>
                                        </div>
                                        <div className="mt-5 bg-white dark:bg-accent rounded-2xl px-6 py-3 flex flex-col items-center justify-center">
                                            <div className="text-center">
                                                Kandungan Pupuk<br/>
                                                <strong>36% P₂O₅ = 16% P</strong>
                                            </div>
                                            <div className="w-full border-b dark:border-gray-500 mt-2"></div>
                                            <div className="mt-5">Dosis SP-36 = <strong>{dosis_sp36(last_data)} gram</strong> per tanaman</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 xl:w-1/3 px-3 mt-10">
                                    <div className="rounded-2xl bg-yellow-100 p-5">
                                        <div className="flex flex-col items-center justify-center -mt-12">
                                            <div className="w-36 h-36 bg-white dark:bg-accent rounded-full shadow-lg px-2 flex items-center justify-center">
                                                <span className="text-center text-xl font-bold">
                                                    {dosis_kcl(last_data)}<br/>gram
                                                </span>
                                            </div>
                                            <span className="text-xl font-bold mt-5 text-gray-800">KCL</span>
                                        </div>
                                        <div className="mt-5 bg-white dark:bg-accent rounded-2xl px-6 py-3 flex flex-col items-center justify-center">
                                            <div className="text-center">
                                                Kandungan Pupuk<br/>
                                                <strong>60% K₂O = 50% K</strong>
                                            </div>
                                            <div className="w-full border-b dark:border-gray-500 mt-2"></div>
                                            <div className="mt-5">Dosis KCL = <strong>{dosis_kcl(last_data)} gram</strong> per tanaman</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end mt-10">
                                <Button 
                                    type="button"
                                    variant="secondary"
                                    className="bg-green-600 hover:bg-green-800 text-white font-bold rounded-full"
                                    onClick={e=>setOpenModal(true)}
                                >
                                    Pupuk Sekarang <ArrowRight/>
                                </Button>
                            </div>
                        </div>
                    :
                        <div className="w-full text-center text-muted-foreground">belum ada data</div>
                    }
                </CardContent>
            </Card>

            {!_.isNull(last_data)&&
                <Dialog open={openModal} onOpenChange={()=>setOpenModal(false)}>
                    <DialogContent 
                        className="sm:max-w-[750px] px-0 py-0 overflow-hidden bg-emerald-200 dark:bg-emerald-800 border-0" 
                        onInteractOutside={e=>e.preventDefault()}
                        onOpenAutoFocus={e=>e.preventDefault()}
                    >
                        <div className="flex">
                            <img src="/images/banner-3.png" className="w-[40%]"/>
                            <div className="w-[60%] flex flex-col justify-center grow px-5 py-2">
                                <strong className="text-lg leading-6">Pupuk sesuai data, bukan kira-kira. Dengan pupuk sekarang, semua jadi otomatis dan akurat!</strong>
                                
                                <Formik
                                    initialValues={{urea:true, sp36:true,kcl:true, jumlah_tanaman:lahan.data.data.jumlah_tanaman}}
                                    onSubmit={(values, actions)=>{
                                        const new_lahan=lahan.data.data
                                        const new_values=Object.assign({}, values, {
                                            lahan_id:lahan_id,
                                            usia_tanaman:countMonth(new_lahan.tgl_tanam, format(new Date(), "yyyy-MM-dd")),
                                            dosis_urea:values.urea?dosis_urea(last_data):"",
                                            dosis_sp36:values.sp36?dosis_sp36(last_data):"",
                                            dosis_kcl:values.kcl?dosis_kcl(last_data):""
                                        })
        
                                        tambah_data.mutate(new_values, {
                                            onSettled:data=>{
                                                actions.setSubmitting(false)
                                            }
                                        })
                                    }}
                                    enableReinitialize
                                >
                                    {formik=>(
                                        <form onSubmit={formik.handleSubmit}>
                                            <div className="flex flex-col gap-2 py-4">
                                                <Label className="bg-white border-white flex items-start gap-3 rounded-lg border p-3 py-2.5 has-[[aria-checked=true]]:border-orange-600 has-[[aria-checked=true]]:bg-orange-400 dark:has-[[aria-checked=true]]:border-orange-600 dark:has-[[aria-checked=true]]:bg-orange-400">
                                                    <Checkbox
                                                        id="toggle-2"
                                                        defaultChecked
                                                        className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white dark:data-[state=checked]:border-green-700 dark:data-[state=checked]:bg-green-700"
                                                        onCheckedChange={e=>formik.setFieldValue("urea", e)}
                                                    />
                                                    <div className="grid gap-1.5 font-normal">
                                                        <p className="text-base text-gray-800 leading-none font-medium">
                                                            Urea <strong>{dosis_urea(last_data)*formik.values.jumlah_tanaman}</strong> gram
                                                        </p>
                                                    </div>
                                                </Label>
                                                <Label className="bg-white border-white flex items-start gap-3 rounded-lg border p-3 py-2.5 has-[[aria-checked=true]]:border-orange-600 has-[[aria-checked=true]]:bg-orange-400 dark:has-[[aria-checked=true]]:border-orange-600 dark:has-[[aria-checked=true]]:bg-orange-400">
                                                    <Checkbox
                                                        id="toggle-2"
                                                        defaultChecked
                                                        className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white dark:data-[state=checked]:border-green-700 dark:data-[state=checked]:bg-green-700"
                                                        onCheckedChange={e=>formik.setFieldValue("sp36", e)}
                                                    />
                                                    <div className="grid gap-1.5 font-normal">
                                                        <p className="text-base text-gray-800 leading-none font-medium">
                                                            SP-36 <strong>{dosis_sp36(last_data)*formik.values.jumlah_tanaman}</strong> gram
                                                        </p>
                                                    </div>
                                                </Label>
                                                <Label className="bg-white border-white flex items-start gap-3 rounded-lg border p-3 py-2.5 has-[[aria-checked=true]]:border-orange-600 has-[[aria-checked=true]]:bg-orange-400 dark:has-[[aria-checked=true]]:border-orange-600 dark:has-[[aria-checked=true]]:bg-orange-400">
                                                    <Checkbox
                                                        id="toggle-2"
                                                        defaultChecked
                                                        className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white dark:data-[state=checked]:border-green-700 dark:data-[state=checked]:bg-green-700"
                                                        onCheckedChange={e=>formik.setFieldValue("kcl", e)}
                                                    />
                                                    <div className="grid gap-1.5 font-normal">
                                                        <p className="text-base text-gray-800 leading-none font-medium">
                                                            KCl <strong>{dosis_kcl(last_data)*formik.values.jumlah_tanaman}</strong> gram
                                                        </p>
                                                    </div>
                                                </Label>
                                            </div>
                                            <div className="flex justify-center mt-3">
                                                <Button 
                                                    type="submit"
                                                    variant="secondary"
                                                    className="bg-green-600 hover:bg-green-800 text-white font-bold text-base"
                                                    disabled={formik.isSubmitting||!(formik.isValid)}
                                                >
                                                    Pupuk Sekarang ({formik.values.jumlah_tanaman} pohon)
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            }
        </>
    )
}

const DataPupuk=({dataSource, filter, setFilter})=>{

    const lahan_id=usePage().props.lahan_id

    //DATA/MUTATION

    //VALUES

    
    return (
        <>
            <Card className="mb-5">
                <CardHeader>
                    <CardTitle>Riwayat Pemupukan</CardTitle>
                </CardHeader>
                <CardContent className="mt-1">
                    {lahan_id!=""?
                        <div className="flex flex-col">
                            <TablePagination
                                dataSource={dataSource}
                                filter={filter}
                                setFilter={setFilter}
                                refreshData={()=>queryClient.refetchQueries("gets_pupuk_lahan")}
                                columns={[
                                    {
                                        headerClassName:"w-[50px] px-4",
                                        itemClassName:"font-medium px-4",
                                        header:"#",
                                        renderItem:(item, idx, page, filter)=>(
                                            <>{(idx+1)+((page-1)*filter.per_page)}</>
                                        )
                                    },
                                    {
                                        header:"Usia Tanaman",
                                        renderItem:(item)=>(
                                            <>{item.usia_tanaman} bulan</>
                                        )
                                    },
                                    {
                                        headerClassName:"w-[120px]",
                                        header:"Jumlah Tanaman",
                                        renderItem:(item)=>(
                                            <>{item.jumlah_tanaman}</>
                                        )
                                    },
                                    {
                                        headerClassName:"w-[150px]",
                                        header:"Dosis Urea",
                                        renderItem:(item)=>(
                                            <>{!_.isNull(item.dosis_urea)?<><strong>{item.dosis_urea*item.jumlah_tanaman}</strong> gram</>:<XCircle className="text-red-600"/>}</>
                                        )
                                    },
                                    {
                                        headerClassName:"w-[150px]",
                                        header:"Dosis SP-36",
                                        renderItem:(item)=>(
                                            <>{!_.isNull(item.dosis_sp36)?<><strong>{item.dosis_sp36*item.jumlah_tanaman}</strong> gram</>:<XCircle className="text-red-600"/>}</>
                                        )
                                    },
                                    {
                                        headerClassName:"w-[150px]",
                                        header:"Dosis KCl",
                                        renderItem:(item)=>(
                                            <>{!_.isNull(item.dosis_kcl)?<><strong>{item.dosis_kcl*item.jumlah_tanaman}</strong> gram</>:<XCircle className="text-red-600"/>}</>
                                        )
                                    },
                                    {
                                        headerClassName:"w-[150px]",
                                        header:"Tanggal Pemupukan",
                                        renderItem:(item)=>(
                                            <>{format(item.created_at, "dd/MM/yyyy")}</>
                                        )
                                    },
                                    {
                                        headerClassName:"w-[50px] px-4",
                                        itemClassName:"px-4 py-1",
                                        header:"",
                                        renderItem:(item)=>(
                                            <div className="flex">
                                                
                                            </div>
                                        )
                                    }
                                ]}
                            />
                        </div>
                    :
                        <div className="w-full text-center text-muted-foreground">belum ada data</div>
                    }
                </CardContent>
            </Card>
        </>
    )
}