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
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {Select as ReactSelect} from "@/components/select-form"
import { ArrowRight, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Edit2, Ellipsis, Filter, PlusIcon, Trash2, Wifi, WifiOff } from "lucide-react"
import { NumericFormat } from 'react-number-format'

import { toast } from "sonner"
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import * as yup from "yup"
import { Formik } from 'formik'
import { lahan_detail_request, lahan_request, modbus_sensor_request, modbus_server_request } from "@/config/request"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Head, router, usePage } from "@inertiajs/react"
import TableContent from "@/components/widget.table-pagination"
import { queryClient } from '@/Config/query_client'
import { DatePicker } from "@/components/datepicker"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import WidgetTanaman from "@/components/widget.tanaman"
import TanamanPagination from "@/components/widget.tanaman-pagination"
import swal from "sweetalert2"
import withReactContent from 'sweetalert2-react-content'
import _ from "underscore"
import {countMonth, options_lahan} from "@/config/helpers"

const MySwal=withReactContent(swal)


export default function Page(props) {
    const lahan_id=props.lahan_id

    const modbus_server_url=props.modbus_server_url

    const intervalRef=useRef()


    //DATA/MUTATION
    const tambah_detail=useMutation({
        mutationFn:params=>lahan_detail_request.add(params),
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Insert Data Failed! ", {position:"bottom-center"})
        }
    })
    const data_sensor=useMutation({
        mutationFn:params=>modbus_server_request.data_sensor(modbus_server_url, params),
        onError:err=>{
            if(err.response.data?.error=="process_not_found")
                toast.error("Modbus Process not Found!", {position:"bottom-center"})
            else if(err.response.data?.error=="process_changed")
                toast.error("Modbus Process Changed, Not Allowed!", {position:"bottom-center"})
            else
                toast.error("Connection Failed!", {position:"bottom-center"})
        },
        retry:1
    })
    const connect_modbus=useMutation({
        mutationFn:params=>modbus_server_request.connect(modbus_server_url, params),
        onError:err=>{
            toast.error("Connection Failed!", {position:"bottom-center"})
        }
    })
    const close_connect_modbus=useMutation({
        mutationFn:params=>modbus_server_request.close_connect(modbus_server_url, params),
        onError:err=>{
            if(err.response.data?.error=="process_not_found")
                toast.error("Modbus Process not Found!", {position:"bottom-center"})
            else if(err.response.data?.error=="process_changed")
                toast.error("Modbus Process Changed, Not Allowed!", {position:"bottom-center"})
            else
                toast.error("Close Connection Failed!", {position:"bottom-center"})
        }
    })

    //VALUES
    const form_input={
        lahan_id:lahan_id,
        sensor_status:"not_connected",
        sensor_process_id:"",
        soil_n:"",
        soil_p:"",
        soil_k:"",
        soil_ph:"",
        cec:"",
        soil_ec:"",
        soil_h:"",
        soil_t:"",
        usia_tanaman:lahan_id!=""?countMonth(props.lahan.find(f=>f.id==lahan_id).tgl_tanam, format(new Date(), "yyyy-MM-dd")):"",
        curah_hujan:""
    }
    const connectModbus=(formik)=>{
        const lahan_data=props.lahan.find(f=>f.id=formik.values.lahan_id)

        const params={
            port:lahan_data?.modbus_port,
            url:lahan_data?.modbus_url,
            lahan_id:formik.values.lahan_id

        }
        
        connect_modbus.mutate(params, {
            onSuccess:data1=>{
                formik.setFieldValue("sensor_process_id", data1.process_id)
                formik.setFieldValue("sensor_status", "connected")
                
                const interval=setInterval(() => {
                    data_sensor.mutate(
                        Object.assign({}, params, {
                            process_id:data1.process_id
                        }),
                        {
                            onSuccess:data2=>{
                                formik.setFieldValue("soil_n", (typeof data2.data[0]!="undefined")?data2.data[0]:"")
                                formik.setFieldValue("soil_p", (typeof data2.data[1]!="undefined")?data2.data[1]:"")
                                formik.setFieldValue("soil_k", (typeof data2.data[2]!="undefined")?data2.data[2]:"")
                                formik.setFieldValue("soil_ph", (typeof data2.data[3]!="undefined")?data2.data[3]:"")
                                formik.setFieldValue("cec", (typeof data2.data[4]!="undefined")?data2.data[4]:"")
                                formik.setFieldValue("soil_ec", (typeof data2.data[5]!="undefined")?data2.data[5]:"")
                                formik.setFieldValue("soil_h", (typeof data2.data[6]!="undefined")?data2.data[6]:"")
                                formik.setFieldValue("soil_t", (typeof data2.data[7]!="undefined")?data2.data[7]:"")
                            }
                        }
                    )
                }, 1000);
                intervalRef.current=interval
            }
        })
    }
    const disconnectModbus=(formik)=>{
        const params={
            lahan_id:formik.values.lahan_id,
            process_id:formik.values.sensor_process_id

        }
        close_connect_modbus.mutate(params, {
            onSuccess:data2=>{
                formik.setFieldValue("sensor_process_id", "")
                formik.setFieldValue("sensor_status", "not_connected")
                clearInterval(intervalRef.current)
            }
        })
    }


    return (
        <>
            <Head>
                <title>Cek Tanaman</title>
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
                            <h1 className="text-base font-medium">Cek Tanaman</h1>
                        </div>
                    </header>
                    <div className="w-full lg:w-1/2 xl:w-1/3 mx-auto mt-5">
                        <Formik
                            initialValues={form_input}
                            onSubmit={(values, actions)=>{
                                const new_values=Object.assign({}, values, {
                                })

                                tambah_detail.mutate(new_values, {
                                    onSettled:data=>{
                                        actions.setSubmitting(false)
                                    },
                                    onSuccess:data=>{
                                        router.visit(`/?lahan_id=${new_values.lahan_id}`)
                                    }
                                })
                            }}
                            validationSchema={
                                yup.object().shape({
                                    lahan_id:yup.string().required(),
                                    soil_n:yup.string().required(),
                                    soil_p:yup.string().required(),
                                    soil_k:yup.string().required(),
                                    soil_ph:yup.string().required(),
                                    cec:yup.string().required(),
                                    soil_ec:yup.string().required(),
                                    soil_h:yup.string().required(),
                                    soil_t:yup.string().required(),
                                    usia_tanaman:yup.string().required(),
                                    curah_hujan:yup.string().required()
                                })
                            }
                            enableReinitialize
                        >
                            {formik=>(
                                <form className="flex flex-col py-4 px-6" onSubmit={formik.handleSubmit}>
                                    <div className="mb-5">
                                        <div className="grid grid-cols-4 items-center mb-1">
                                            <Label>Lahan</Label>
                                            <div className="flex flex-end col-span-3">
                                                <ReactSelect
                                                    options={options_lahan(props.lahan)}
                                                    value={options_lahan(props.lahan).find(f=>f.value==formik.values.lahan_id)}
                                                    onChange={e=>{
                                                        formik.setFieldValue("lahan_id", e.value)

                                                        let usia_tanaman=""
                                                        if(e.value!=""){
                                                            usia_tanaman=countMonth(e.data.tgl_tanam, format(new Date(), "yyyy-MM-dd"))
                                                        }
                                                        formik.setFieldValue("usia_tanaman", usia_tanaman)
                                                    }}
                                                    className="grow mr-1"
                                                    isDisabled={formik.values.sensor_status=="connected"}
                                                />
                                                {formik.values.sensor_status=="connected"?
                                                    <Button 
                                                        type="button"
                                                        variant="outline"
                                                        className="bg-red-700 hover:bg-red-800 border-0 text-white hover:text-white"
                                                        onClick={()=>disconnectModbus(formik)}
                                                    >
                                                        Disconnect Modbus
                                                    </Button>
                                                :
                                                    <Button 
                                                        type="button"
                                                        variant="outline"
                                                        className="bg-green-700 hover:bg-green-800 border-0 text-white hover:text-white"
                                                        onClick={()=>connectModbus(formik)}
                                                        disabled={formik.values.lahan_id==""}
                                                    >
                                                        Connect Modbus
                                                    </Button>
                                                }
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4">
                                            <span></span>
                                            {formik.values.sensor_status=="connected"?
                                                <span className="flex items-center text-sm text-green-700 col-span-3">
                                                    <Wifi size={16}/>
                                                    <span className="ml-1">Sensor connected.</span>
                                                </span>
                                            :
                                                <span className="flex items-center text-sm text-muted-foreground col-span-3">
                                                    <WifiOff size={16}/>
                                                    <span className="ml-1">Sensor not connected.</span>
                                                </span>
                                            }
                                        </div>
                                    </div>
                                    <div className="mb-5">
                                        <div className="grid grid-cols-4 items-center mb-1">
                                            <Label>Soil Nitrogen</Label>
                                            <div className="relative flex col-span-3">
                                                <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-sm">
                                                    %
                                                </div>
                                                <Input
                                                    placeholder=""
                                                    className="col-span-3 pr-10"
                                                    maxLength={200}
                                                    name="soil_n"
                                                    value={formik.values.soil_n}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center mb-1">
                                            <Label>Soil Phosphor</Label>
                                            <div className="relative flex col-span-3">
                                                <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-sm">
                                                    ppm
                                                </div>
                                                <Input
                                                    placeholder=""
                                                    className="col-span-3 pr-10"
                                                    maxLength={200}
                                                    name="soil_p"
                                                    value={formik.values.soil_p}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center mb-1">
                                            <Label>Soil Kalium</Label>
                                            <div className="relative flex col-span-3">
                                                <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-sm">
                                                    me/100g
                                                </div>
                                                <Input
                                                    placeholder=""
                                                    className="col-span-3 pr-10"
                                                    maxLength={200}
                                                    name="soil_k"
                                                    value={formik.values.soil_k}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center mb-1">
                                            <Label>Soil pH</Label>
                                            <div className="relative flex col-span-3">
                                                <Input
                                                    placeholder=""
                                                    className="col-span-3 pr-10"
                                                    maxLength={200}
                                                    name="soil_ph"
                                                    value={formik.values.soil_ph}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center mb-1">
                                            <Label>Kapasitas Tukar Kation</Label>
                                            <div className="relative flex col-span-3">
                                                <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-sm">
                                                    me/100g
                                                </div>
                                                <Input
                                                    placeholder=""
                                                    className="col-span-3 pr-10"
                                                    maxLength={200}
                                                    name="cec"
                                                    value={formik.values.cec}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center mb-1">
                                            <Label>Soil Conductivity</Label>
                                            <div className="relative flex col-span-3">
                                                <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-sm">
                                                    dS/m
                                                </div>
                                                <Input
                                                    placeholder=""
                                                    className="col-span-3 pr-10"
                                                    maxLength={200}
                                                    name="soil_ec"
                                                    value={formik.values.soil_ec}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center mb-1">
                                            <Label>Soil Humidity</Label>
                                            <div className="relative flex col-span-3">
                                                <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-sm">
                                                    %
                                                </div>
                                                <Input
                                                    placeholder=""
                                                    className="col-span-3 pr-10"
                                                    maxLength={200}
                                                    name="soil_h"
                                                    value={formik.values.soil_h}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center">
                                            <Label>Soil Temperature</Label>
                                            <div className="relative flex col-span-3">
                                                <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-sm">
                                                    °C
                                                </div>
                                                <Input
                                                    placeholder=""
                                                    className="col-span-3 pr-10"
                                                    maxLength={200}
                                                    name="soil_t"
                                                    value={formik.values.soil_t}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center mb-5">
                                        <Label>Usia Tanaman</Label>
                                        <div className="relative flex col-span-3">
                                            <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-sm">
                                                bulan
                                            </div>
                                            <NumericFormat 
                                                value={formik.values.usia_tanaman} 
                                                onValueChange={(values)=>formik.setFieldValue("usia_tanaman", values.value)}
                                                customInput={Input} 
                                                decimalScale={0}
                                                className="w-full pr-14"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center mb-5">
                                        <Label>Curah Hujan</Label>
                                        <div className="relative flex col-span-3">
                                            <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-sm">
                                                mm
                                            </div>
                                            <NumericFormat 
                                                value={formik.values.curah_hujan} 
                                                onValueChange={(values)=>formik.setFieldValue("curah_hujan", values.value)}
                                                customInput={Input} 
                                                thousandSeparator
                                                className="w-full pr-10"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-4 items-center mb-5">
                                        <span></span>
                                        <Button 
                                            type="submit"
                                            disabled={formik.isSubmitting||!(formik.dirty&&formik.isValid)}
                                        >
                                            Save changes
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </Formik>

                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}

const ListTanaman=(props)=>{

    //DATA/MUTATION
    const hapus_data=useMutation({
        mutationFn:(id)=>lahan_request.delete(id),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_lahan")
        },
        onError:err=>{
            toast.error("Remove Data Failed!", {position:"bottom-center"})
        }
    })

    return (
        <>
            <TanamanPagination
                dataSource={props.dataSource}
                filter={props.filter}
                setFilter={props.setFilter}
                refreshData={()=>queryClient.refetchQueries("gets_lahan")}
                renderItem={(item)=>(
                    <WidgetTanaman
                        data={item}
                        toggleEdit={(data, show)=>props.toggleEdit(data, show)}
                        deleteAction={()=>{
                            MySwal.fire({
                                title: "Yakin ingin menghapus data?",
                                text: "Data yang sudah dihapus mungkin tidak bisa dikembalikan lagi!",
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'Ya, Hapus Data!',
                                cancelButtonText: 'Batal!',
                                reverseButtons: true,
                                customClass:{
                                    popup:"!w-auto !bg-accent !rounded-2xl",
                                    title:"!text-lg",
                                    htmlContainer:"!text-sm",
                                    confirmButton:"focus:outline-none text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2 me-2 mb-2",
                                    cancelButton:"py-2 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10"
                                },
                                buttonsStyling:false
                            })
                            .then(result=>{
                                if(result.isConfirmed){
                                    hapus_data.mutate(item.id)
                                }
                            })
                        }}
                    />
                )}
            />
        </>
    )
}
