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
import { ArrowRight, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Edit2, Ellipsis, Filter, Plus, PlusIcon, Trash2 } from "lucide-react"
import { NumericFormat } from 'react-number-format'

import { toast } from "sonner"
import axios from "axios"
import { useEffect, useState } from "react"
import * as yup from "yup"
import { Formik } from 'formik'
import { ews_request, lahan_request, modbus_sensor_request, pupuk_request } from "@/config/request"
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

const MySwal=withReactContent(swal)


export default function Page(props) {

    const [form_input, setFormInput]=useState({
        modbus_url:"127.0.0.1",
        modbus_port:"502",
        berat_rabuk:"",
        motor_value:"8",
        konsentrasi_per_liter:"10"
    })
    const [response, setResponse]=useState({
        waktu_tunggu_ideal:"",
        waktu_tunggu_simulasi:""
    })

    useEffect(()=>{
    }, [])

    //DATA/MUTATION
    const simulate_data=useMutation({
            mutationFn:params=>pupuk_request.simulate_rabuk(params),
            onError:err=>{
                if(err.response.data?.error=="VALIDATION_ERROR")
                    toast.error(err.response.data.data, {position:"bottom-center"})
                else
                    toast.error("Insert Data Failed! ", {position:"bottom-center"})
            }
        })

    //VALUES
    const options_modbus_url=()=>{
        const default_data=[
            {label:"127.0.0.1", value:"127.0.0.1"},
            {label:"10.10.1.2", value:"10.10.1.2"}
        ]

        return default_data
    }
    const options_modbus_port=()=>{
        const default_data=[
            {label:"502", value:"502"}
        ]

        return default_data
    }
    const options_modbus_motor_value=()=>{
        const default_data=[
            {label:"Buka 25%", value:"8"},
            {label:"Buka 60%", value:"16"},
            {label:"Buka full", value:"20"}
        ]

        return default_data
    }

    //ACTIONS

    return (
        <>
            <Head>
                <title>Simulasi Pemupukan</title>
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
                            <h1 className="text-base font-medium">Simulasi Pemupukan</h1>
                        </div>
                    </header>
                    <div className="w-full lg:w-1/2 xl:w-1/3 mx-auto mt-5">
                        <Formik
                            initialValues={form_input}
                            onSubmit={(values, actions)=>{
                                const new_values=Object.assign({}, values, {
                                })

                                simulate_data.mutate(new_values, {
                                    onSettled:data=>{
                                        actions.setSubmitting(false)
                                    },
                                    onSuccess:data=>{
                                        setResponse(data)
                                    }
                                })
                            }}
                            validationSchema={
                                yup.object().shape({
                                    modbus_url:yup.string().required(),
                                    modbus_port:yup.string().required(),
                                    berat_rabuk:yup.string().required(),
                                    motor_value:yup.string().required(),
                                    konsentrasi_per_liter:yup.string().required()
                                })
                            }
                            enableReinitialize
                        >
                            {formik=>(
                                <form className="grid gap-4 py-4 px-6" onSubmit={formik.handleSubmit}>
                                    <div className="grid grid-cols-5 items-center gap-2">
                                        <Label className="col-span-2">Modbus URL</Label>
                                        <ReactSelect
                                            options={options_modbus_url()}
                                            value={options_modbus_url().find(f=>f.value==formik.values.modbus_url)}
                                            onChange={e=>{
                                                formik.setFieldValue("modbus_url", e.value)
                                            }}
                                            className="grow mb-1 col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-5 items-center gap-2">
                                        <Label className="col-span-2">Modbus Port</Label>
                                        <ReactSelect
                                            options={options_modbus_port()}
                                            value={options_modbus_port().find(f=>f.value==formik.values.modbus_port)}
                                            onChange={e=>{
                                                formik.setFieldValue("modbus_port", e.value)
                                            }}
                                            className="grow mb-1 col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-5 items-center gap-2">
                                        <Label className="col-span-2">Motor Pembukaan</Label>
                                        <ReactSelect
                                            options={options_modbus_motor_value()}
                                            value={options_modbus_motor_value().find(f=>f.value==formik.values.motor_value)}
                                            onChange={e=>{
                                                formik.setFieldValue("motor_value", e.value)
                                            }}
                                            className="grow mb-1 col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-5 items-center gap-2">
                                        <Label className="col-span-2">Kandungan Pupuk</Label>
                                        <div className="relative flex col-span-3">
                                            <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-sm">
                                                gram/L
                                            </div>
                                            
                                            <NumericFormat 
                                                value={formik.values.konsentrasi_per_liter} 
                                                onValueChange={(values)=>formik.setFieldValue("konsentrasi_per_liter", values.value)}
                                                customInput={Input} 
                                                thousandSeparator 
                                                className="pr-10 w-full" 
                                                decimalScale={0}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-5 items-center gap-2">
                                        <Label className="col-span-2">Berat Pupuk yang akan Disimulasi</Label>
                                        <div className="relative flex col-span-3">
                                            <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-sm">
                                                gram
                                            </div>
                                            
                                            <NumericFormat 
                                                value={formik.values.berat_rabuk} 
                                                onValueChange={(values)=>formik.setFieldValue("berat_rabuk", values.value)}
                                                customInput={Input} 
                                                thousandSeparator 
                                                className="pr-10 w-full" 
                                                decimalScale={2}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-5 items-start gap-2 mt-5">
                                        <Label className="col-span-2"></Label>
                                        <Button 
                                            type="submit" 
                                            disabled={formik.isSubmitting||!(formik.dirty&&formik.isValid)}
                                            className="w-[150px]"
                                        >
                                            Simulasi Pemupukan
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </Formik>

                        <div className="border bg-accent rounded-lg p-3 mx-5 mt-10 text-sm">
                            <span className="text-base font-bold">Response :</span>
                            {response.waktu_tunggu_ideal!==""&&
                                <div className="flex flex-col items-start gap-0.5 mt-3 text-sm">
                                    <div>Waktu Tunggu Ideal : {response.waktu_tunggu_ideal}</div>
                                    <div>Waktu Tunggu aktual yang disimulasikan : {response.waktu_tunggu_simulasi}</div>
                                    <Button 
                                        type="button" 
                                        size={10} 
                                        className="px-3 font-normal" 
                                        variant="outline"
                                        onClick={e=>{
                                            setResponse({
                                                waktu_tunggu_ideal:"",
                                                waktu_tunggu_simulasi:""
                                            })
                                        }}
                                    >
                                        reset
                                    </Button>
                                </div>
                            }
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}

