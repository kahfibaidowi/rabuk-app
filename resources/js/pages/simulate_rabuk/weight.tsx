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
import { ArrowRight, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Edit2, Ellipsis, Filter, Minus, MinusIcon, Plus, PlusIcon, Trash2 } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"

const MySwal=withReactContent(swal)


export default function Page(props) {

    const [form_input, setFormInput]=useState({
        modbus_url:"127.0.0.1",
        modbus_port:"502",
        sensor_selected_v1:true,
        address_v1:"40029",
        berat_rabuk_v1:"",
        sensor_selected_v2:true,
        address_v2:"40031",
        berat_rabuk_v2:"",
        sensor_selected_v3:true,
        address_v3:"40033",
        berat_rabuk_v3:""
    })
    const [response, setResponse]=useState({
        data:[{status:"idle"}, {status:"idle"}, {status:"idle"}]
    })

    useEffect(()=>{
    }, [])

    //DATA/MUTATION
    const simulate_data=useMutation({
        mutationFn:params=>pupuk_request.simulate_weight(params),
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Process Data Failed! ", {position:"bottom-center"})
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
    const options_rabuk=()=>{
        const default_data=[
            {label:"Urea", value:"urea"},
            {label:"SP-36", value:"sp36"},
            {label:"KCl", value:"kcl"}
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
                                    sensor_selected_v1:yup.boolean().required(),
                                    address_v1:yup.string().when("sensor_selected_v1", {is:true, then:(schema)=>schema.required()}),
                                    berat_rabuk_v1:yup.string().when("sensor_selected_v1", {is:true, then:(schema)=>schema.required()}),
                                    sensor_selected_v2:yup.boolean().required(),
                                    address_v2:yup.string().when("sensor_selected_v2", {is:true, then:(schema)=>schema.required()}),
                                    berat_rabuk_v2:yup.string().when("sensor_selected_v2", {is:true, then:(schema)=>schema.required()}),
                                    sensor_selected_v3:yup.boolean().required(),
                                    address_v3:yup.string().when("sensor_selected_v3", {is:true, then:(schema)=>schema.required()}),
                                    berat_rabuk_v3:yup.string().when("sensor_selected_v3", {is:true, then:(schema)=>schema.required()}),
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
                                        <Label className="col-span-2">Motor Valve 1</Label>
                                        <div className="flex flex-col col-span-3">
                                            <div className="flex items-center mb-1">
                                                <Switch
                                                    checked={formik.values.sensor_selected_v1}
                                                    onCheckedChange={()=>formik.setFieldValue("sensor_selected_v1", !formik.values.sensor_selected_v1)}
                                                />
                                                <span className="ml-2 text-sm">Aktifkan Motor Valve</span>
                                            </div>
                                            <NumericFormat 
                                                value={formik.values.address_v1} 
                                                onValueChange={(values)=>formik.setFieldValue("address_v1", values.value)}
                                                customInput={Input} 
                                                thousandSeparator={false}
                                                className="mb-1" 
                                                decimalScale={0}
                                                allowNegative={false}
                                                allowLeadingZeros
                                                maxLength={5}
                                                step={100}
                                                placeholder="Modbus Address | 400XX"
                                                disabled={!formik.values.sensor_selected_v1}
                                            />
                                            <div className="relative flex">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="rounded-r-none"
                                                    onClick={e=>formik.setFieldValue("berat_rabuk_v1", Math.max(0, formik.values.berat_rabuk_v1-100))}
                                                    disabled={!formik.values.sensor_selected_v1}
                                                >
                                                    <MinusIcon/>
                                                </Button>
                                                <NumericFormat 
                                                    value={formik.values.berat_rabuk_v1} 
                                                    onValueChange={(values)=>formik.setFieldValue("berat_rabuk_v1", values.value)}
                                                    customInput={Input} 
                                                    thousandSeparator 
                                                    className="text-center w-full rounded-none" 
                                                    decimalScale={0}
                                                    allowNegative={false}
                                                    placeholder="Berat Rabuk"
                                                    disabled={!formik.values.sensor_selected_v1}
                                                    suffix=" ml"
                                                    
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="rounded-l-none"
                                                    onClick={e=>formik.setFieldValue("berat_rabuk_v1", Math.max(0, Number(formik.values.berat_rabuk_v1)+100))}
                                                    disabled={!formik.values.sensor_selected_v1}
                                                >
                                                    <PlusIcon/>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-5 items-center gap-2">
                                        <Label className="col-span-2">Motor Valve 2</Label>
                                        <div className="flex flex-col col-span-3">
                                            <div className="flex items-center mb-1">
                                                <Switch
                                                    checked={formik.values.sensor_selected_v2}
                                                    onCheckedChange={()=>formik.setFieldValue("sensor_selected_v2", !formik.values.sensor_selected_v2)}
                                                />
                                                <span className="ml-2 text-sm">Aktifkan Motor Valve</span>
                                            </div>
                                            <NumericFormat 
                                                value={formik.values.address_v2} 
                                                onValueChange={(values)=>formik.setFieldValue("address_v2", values.value)}
                                                customInput={Input} 
                                                thousandSeparator={false}
                                                className="mb-1" 
                                                decimalScale={0}
                                                allowNegative={false}
                                                allowLeadingZeros
                                                maxLength={5}
                                                placeholder="Modbus Address | 400XX"
                                                disabled={!formik.values.sensor_selected_v2}
                                            />
                                            <div className="relative flex">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="rounded-r-none"
                                                    onClick={e=>formik.setFieldValue("berat_rabuk_v2", Math.max(0, formik.values.berat_rabuk_v2-100))}
                                                    disabled={!formik.values.sensor_selected_v2}
                                                >
                                                    <MinusIcon/>
                                                </Button>
                                                <NumericFormat 
                                                    value={formik.values.berat_rabuk_v2} 
                                                    onValueChange={(values)=>formik.setFieldValue("berat_rabuk_v2", values.value)}
                                                    customInput={Input} 
                                                    thousandSeparator 
                                                    className="text-center w-full rounded-none" 
                                                    decimalScale={0}
                                                    allowNegative={false}
                                                    placeholder="Berat Rabuk"
                                                    disabled={!formik.values.sensor_selected_v2}
                                                    suffix=" ml"
                                                    
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="rounded-l-none"
                                                    onClick={e=>formik.setFieldValue("berat_rabuk_v2", Math.max(0, Number(formik.values.berat_rabuk_v2)+100))}
                                                    disabled={!formik.values.sensor_selected_v2}
                                                >
                                                    <PlusIcon/>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-5 items-center gap-2">
                                        <Label className="col-span-2">Motor Valve 3</Label>
                                        <div className="flex flex-col col-span-3">
                                            <div className="flex items-center mb-1">
                                                <Switch
                                                    checked={formik.values.sensor_selected_v3}
                                                    onCheckedChange={()=>formik.setFieldValue("sensor_selected_v3", !formik.values.sensor_selected_v3)}
                                                />
                                                <span className="ml-2 text-sm">Aktifkan Motor Valve</span>
                                            </div>
                                            <NumericFormat 
                                                value={formik.values.address_v3} 
                                                onValueChange={(values)=>formik.setFieldValue("address_v3", values.value)}
                                                customInput={Input} 
                                                thousandSeparator={false}
                                                className="mb-1" 
                                                decimalScale={0}
                                                allowNegative={false}
                                                allowLeadingZeros
                                                maxLength={5}
                                                placeholder="Modbus Address | 400XX"
                                                disabled={!formik.values.sensor_selected_v3}
                                            />
                                            
                                            <div className="relative flex">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="rounded-r-none"
                                                    onClick={e=>formik.setFieldValue("berat_rabuk_v3", Math.max(0, formik.values.berat_rabuk_v3-100))}
                                                    disabled={!formik.values.sensor_selected_v3}
                                                >
                                                    <MinusIcon/>
                                                </Button>
                                                <NumericFormat 
                                                    value={formik.values.berat_rabuk_v3} 
                                                    onValueChange={(values)=>formik.setFieldValue("berat_rabuk_v3", values.value)}
                                                    customInput={Input} 
                                                    thousandSeparator 
                                                    className="text-center w-full rounded-none" 
                                                    decimalScale={0}
                                                    allowNegative={false}
                                                    placeholder="Berat Rabuk"
                                                    disabled={!formik.values.sensor_selected_v3}
                                                    suffix=" ml"
                                                    
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="rounded-l-none"
                                                    onClick={e=>formik.setFieldValue("berat_rabuk_v3", Math.max(0, Number(formik.values.berat_rabuk_v3)+100))}
                                                    disabled={!formik.values.sensor_selected_v3}
                                                >
                                                    <PlusIcon/>
                                                </Button>
                                            </div>
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

                        <div className="border bg-accent rounded-lg p-3 mx-5 mt-10 text-sm mb-5">
                            <span className="text-base font-bold">Response :</span>
                            {response.data[0].status=="success"&&
                                <pre className="mt-2">
                                    Name : {response.data[0].name}{'\n'}
                                    Waktu Tunggu : {response.data[0].waktu_tunggu}{'\n'}
                                    Waktu Tunggu (Simulasi) : {response.data[0].waktu_tunggu_simulasi}
                                </pre>
                            }
                            {response.data[1].status=="success"&&
                                <pre className="mt-2">
                                    Name : {response.data[1].name}{'\n'}
                                    Waktu Tunggu : {response.data[1].waktu_tunggu}{'\n'}
                                    Waktu Tunggu (Simulasi) : {response.data[1].waktu_tunggu_simulasi}
                                </pre>
                            }
                            {response.data[2].status=="success"&&
                                <pre className="mt-2">
                                    Name : {response.data[2].name}{'\n'}
                                    Waktu Tunggu : {response.data[2].waktu_tunggu}{'\n'}
                                    Waktu Tunggu (Simulasi) : {response.data[2].waktu_tunggu_simulasi}
                                </pre>
                            }
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}

