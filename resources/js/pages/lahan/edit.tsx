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
import { ArrowRight, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Edit, Edit2, Ellipsis, Filter, Plus, PlusIcon, Trash2 } from "lucide-react"
import { NumericFormat } from 'react-number-format'

import { toast } from "sonner"
import axios from "axios"
import { useState } from "react"
import * as yup from "yup"
import { Formik } from 'formik'
import { lahan_request, modbus_sensor_request } from "@/config/request"
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

    const [form_input, setFormInput]=useState(props.lahan)

    //DATA/MUTATION
    const edit_data=useMutation({
        mutationFn:params=>lahan_request.update(params.id, params),
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Update Data Failed! ", {position:"bottom-center"})
        }
    })

    //ACTIONS

    return (
        <>
            <Head>
                <title>Edit Lahan</title>
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
                            <h1 className="text-base font-medium">Edit Lahan</h1>
                        </div>
                    </header>
                    <div className="w-full lg:w-1/2 xl:w-1/3 mx-auto mt-5">
                        <Formik
                            initialValues={form_input}
                            onSubmit={(values, actions)=>{
                                const new_values=Object.assign({}, values, {
                                })

                                edit_data.mutate(new_values, {
                                    onSettled:data=>{
                                        actions.setSubmitting(false)
                                    },
                                    onSuccess:data=>{
                                        router.visit("/lahan")
                                    }
                                })
                            }}
                            validationSchema={
                                yup.object().shape({
                                    nama_lahan:yup.string().required(),
                                    pemilik:yup.string().required(),
                                    jumlah_tanaman:yup.string().required(),
                                    icon:yup.string().required(),
                                    modbus_url:yup.string().required(),
                                    modbus_port:yup.string().required(),
                                    urea_gram:yup.string().required(),
                                    urea_v_liter:yup.string().required(),
                                    mkp_gram:yup.string().required(),
                                    mkp_v_liter:yup.string().required(),
                                    kcl_gram:yup.string().required(),
                                    kcl_v_liter:yup.string().required()
                                })
                            }
                            enableReinitialize
                        >
                            {formik=>(
                                <form className="grid gap-4 py-4 px-6" onSubmit={formik.handleSubmit}>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label>Nama Lahan</Label>
                                        <Input
                                            placeholder=""
                                            className="col-span-3"
                                            name="nama_lahan"
                                            value={formik.values.nama_lahan}
                                            onChange={formik.handleChange}
                                            maxLength={200}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label>Pemilik</Label>
                                        <Input
                                            placeholder=""
                                            className="col-span-3"
                                            name="pemilik"
                                            value={formik.values.pemilik}
                                            onChange={formik.handleChange}
                                            maxLength={200}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label>Jumlah Tanaman</Label>
                                        <div className="relative flex col-span-3">
                                            <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-sm">
                                                pohon
                                            </div>
                                            
                                            <NumericFormat 
                                                value={formik.values.jumlah_tanaman} 
                                                onValueChange={(values)=>formik.setFieldValue("jumlah_tanaman", values.value)}
                                                customInput={Input} 
                                                thousandSeparator 
                                                className="pr-10 w-full" 
                                                decimalScale={0}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="mb-auto mt-2">Icon Tanaman</Label>
                                        <div className="col-span-3">
                                            <div className="flex flex-wrap">
                                                <div 
                                                    className={cn(
                                                        "w-20 mr-1 border rounded-lg overflow-hidden", {
                                                            "border-4 border-blue-600":formik.values.icon=="/images/plants/1.jpg"
                                                        }
                                                    )}
                                                    onClick={e=>formik.setFieldValue("icon", "/images/plants/1.jpg")}
                                                >
                                                    <img src="/images/plants/1.jpg"/>
                                                </div>
                                                <div 
                                                    className={cn(
                                                        "w-20 mr-1 border rounded-lg overflow-hidden", {
                                                            "border-4 border-blue-600":formik.values.icon=="/images/plants/2.jpg"
                                                        }
                                                    )}
                                                    onClick={e=>formik.setFieldValue("icon", "/images/plants/2.jpg")}
                                                >
                                                    <img src="/images/plants/2.jpg"/>
                                                </div><div 
                                                    className={cn(
                                                        "w-20 mr-1 border rounded-lg overflow-hidden", {
                                                            "border-4 border-blue-600":formik.values.icon=="/images/plants/3.jpg"
                                                        }
                                                    )}
                                                    onClick={e=>formik.setFieldValue("icon", "/images/plants/3.jpg")}
                                                >
                                                    <img src="/images/plants/3.jpg"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label>Modbus URL</Label>
                                        <Input
                                            placeholder="127.0.0.1"
                                            className="col-span-3"
                                            name="modbus_url"
                                            value={formik.values.modbus_url}
                                            onChange={formik.handleChange}
                                            maxLength={200}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label>Modbus PORT</Label>
                                        <Input
                                            placeholder="502"
                                            className="col-span-3"
                                            name="modbus_port"
                                            value={formik.values.modbus_port}
                                            onChange={formik.handleChange}
                                            maxLength={200}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label>Urea gram</Label>
                                        <NumericFormat 
                                            value={formik.values.urea_gram} 
                                            onValueChange={(values)=>formik.setFieldValue("urea_gram", values.value)}
                                            customInput={Input} 
                                            thousandSeparator 
                                            className="pr-10 w-full col-span-3" 
                                            decimalScale={0}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label>Urea volume/liter</Label>
                                        <NumericFormat 
                                            value={formik.values.urea_v_liter} 
                                            onValueChange={(values)=>formik.setFieldValue("urea_v_liter", values.value)}
                                            customInput={Input} 
                                            thousandSeparator 
                                            className="pr-10 w-full col-span-3" 
                                            decimalScale={0}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label>MKP gram</Label>
                                        <NumericFormat 
                                            value={formik.values.mkp_gram} 
                                            onValueChange={(values)=>formik.setFieldValue("mkp_gram", values.value)}
                                            customInput={Input} 
                                            thousandSeparator 
                                            className="pr-10 w-full col-span-3" 
                                            decimalScale={0}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label>MKP volume/liter</Label>
                                        <NumericFormat 
                                            value={formik.values.mkp_v_liter} 
                                            onValueChange={(values)=>formik.setFieldValue("mkp_v_liter", values.value)}
                                            customInput={Input} 
                                            thousandSeparator 
                                            className="pr-10 w-full col-span-3" 
                                            decimalScale={0}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label>KCl gram</Label>
                                        <NumericFormat 
                                            value={formik.values.kcl_gram} 
                                            onValueChange={(values)=>formik.setFieldValue("kcl_gram", values.value)}
                                            customInput={Input} 
                                            thousandSeparator 
                                            className="pr-10 w-full col-span-3" 
                                            decimalScale={0}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label>KCl volume/liter</Label>
                                        <NumericFormat 
                                            value={formik.values.kcl_v_liter} 
                                            onValueChange={(values)=>formik.setFieldValue("kcl_v_liter", values.value)}
                                            customInput={Input} 
                                            thousandSeparator 
                                            className="pr-10 w-full col-span-3" 
                                            decimalScale={0}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4 mt-10">
                                        <Label></Label>
                                        <Button 
                                            type="submit" 
                                            disabled={formik.isSubmitting||!(formik.dirty&&formik.isValid)}
                                        >
                                            <Edit/> Ubah Data
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

