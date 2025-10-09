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
import { ews_request, lahan_request, modbus_sensor_request } from "@/config/request"
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

    const ews_url=props.ews_url

    const [form_input, setFormInput]=useState({
        nama_lahan:"",
        province_id:"",
        regency_id:"",
        ews_district_id:"",
        lokasi:"",
        pemilik:"",
        luas_area:"",
        jarak_tanam:"",
        jumlah_tanaman:"",
        jenis_tanaman:"salak",
        tgl_tanam:null,
        icon:"",
        modbus_url:"",
        modbus_port:"",
        urea_per_liter:"",
        mkp_per_liter:""
    })
    const [provinces, setProvinces]=useState([])
    const [regencies, setRegencies]=useState([])
    const [districts, setDistricts]=useState([])

    useEffect(()=>{
        mt_region.mutate({}, {
            onSuccess:data=>{
                setProvinces(data.data.provinsi)
                setRegencies(data.data.kab_kota)
                setDistricts(data.data.kecamatan)
            }
        })
    }, [])

    //DATA/MUTATION
    const tambah_data=useMutation({
        mutationFn:params=>lahan_request.add(params),
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Insert Data Failed! ", {position:"bottom-center"})
        }
    })
    const mt_region=useMutation({
        mutationFn:params=>ews_request.region(ews_url, params),
        onError:err=>{
            toast.error("Fetch Data Failed! ", {position:"bottom-center"})
        }
    })

    //VALUES
    const options_province=()=>{
        const default_data=[{label:"Pilih Provinsi", value:""}]

        const data=provinces.map(list=>{
            return {label:list.region, value:list.id_region}
        })

        return default_data.concat(data)
    }
    const options_regency=(province_id)=>{
        const default_data=[{label:"Pilih Kabupaten/Kota", value:""}]

        if(province_id==""){
            return default_data
        }

        const data=regencies.filter(f=>f.nested==province_id).map(list=>{
            return {label:list.region, value:list.id_region}
        })

        return default_data.concat(data)
    }
    const options_district=(regency_id)=>{
        const default_data=[{label:"Pilih Kecamatan", value:""}]

        if(regency_id==""){
            return default_data
        }

        const data=districts.filter(f=>f.nested==regency_id).map(list=>{
            return {label:list.region, value:list.id_region}
        })

        return default_data.concat(data)
    }

    //ACTIONS

    return (
        <>
            <Head>
                <title>Tambah Lahan</title>
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
                            <h1 className="text-base font-medium">Tambah Lahan</h1>
                        </div>
                    </header>
                    <div className="w-full lg:w-1/2 xl:w-1/3 mx-auto mt-5">
                        <Formik
                            initialValues={form_input}
                            onSubmit={(values, actions)=>{
                                const new_values=Object.assign({}, values, {
                                    tgl_tanam:format(values.tgl_tanam, "yyyy-MM-dd")
                                })

                                tambah_data.mutate(new_values, {
                                    onSettled:data=>{
                                        actions.setSubmitting(false)
                                    },
                                    onSuccess:data=>{
                                        router.visit(`/lahan`)
                                    }
                                })
                            }}
                            validationSchema={
                                yup.object().shape({
                                    nama_lahan:yup.string().required(),
                                    ews_district_id:yup.string().required(),
                                    lokasi:yup.string().required(),
                                    pemilik:yup.string().required(),
                                    luas_area:yup.string().required(),
                                    jarak_tanam:yup.string().required(),
                                    jumlah_tanaman:yup.string().required(),
                                    jenis_tanaman:yup.string().required(),
                                    tgl_tanam:yup.string().required(),
                                    icon:yup.string().required(),
                                    modbus_url:yup.string().required(),
                                    modbus_port:yup.string().required(),
                                    urea_per_liter:yup.string().required(),
                                    mkp_per_liter:yup.string().required()
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
                                        <Label className="mb-auto mt-2">Lokasi</Label>
                                        <div className="flex flex-col col-span-3">
                                            <ReactSelect
                                                options={options_province()}
                                                value={options_province().find(f=>f.value==formik.values.province_id)}
                                                onChange={e=>{
                                                    formik.setFieldValue("province_id", e.value)
                                                    formik.setFieldValue("regency_id", "")
                                                    formik.setFieldValue("ews_district_id", "")
                                                }}
                                                className="grow mb-1"
                                            />
                                            <ReactSelect
                                                options={options_regency(formik.values.province_id)}
                                                value={options_regency(formik.values.province_id).find(f=>f.value==formik.values.regency_id)}
                                                onChange={e=>{
                                                    formik.setFieldValue("regency_id", e.value)
                                                    formik.setFieldValue("ews_district_id", "")
                                                }}
                                                className="grow mb-1"
                                            />
                                            <ReactSelect
                                                options={options_district(formik.values.regency_id)}
                                                value={options_district(formik.values.regency_id).find(f=>f.value==formik.values.ews_district_id)}
                                                onChange={e=>{
                                                    formik.setFieldValue("ews_district_id", e.value)
                                                }}
                                                className="grow mb-1"
                                            />
                                            <Input
                                            placeholder="nama lokasi"
                                            className="col-span-3"
                                            name="lokasi"
                                            value={formik.values.lokasi}
                                            onChange={formik.handleChange}
                                            maxLength={200}
                                        />
                                        </div>
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
                                        <Label>Luas Area</Label>
                                        <div className="relative flex col-span-3">
                                            <div className="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-sm">
                                                m<sup>2</sup>
                                            </div>
                                            
                                            <NumericFormat 
                                                value={formik.values.luas_area} 
                                                onValueChange={(values)=>formik.setFieldValue("luas_area", values.value)}
                                                customInput={Input} 
                                                thousandSeparator 
                                                className="pr-10 w-full" 
                                                decimalScale={0}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label>Jarak Tanam</Label>
                                        <Input
                                            placeholder=""
                                            className="col-span-3"
                                            name="jarak_tanam"
                                            value={formik.values.jarak_tanam}
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
                                        <Label>Jenis Tanaman</Label>
                                        <Input
                                            type="text"
                                            placeholder=""
                                            className="col-span-3"
                                            value={formik.values.jenis_tanaman}
                                            maxLength={200}
                                            disabled
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label>Tanggal Tanam</Label>
                                        <DatePicker
                                            className="col-span-3 w-full"
                                            date={formik.values.tgl_tanam}
                                            setDate={(date)=>formik.setFieldValue("tgl_tanam", date)}
                                            placeholder="Pilih tanggal"
                                        />
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
                                        <Label>Konsentrasi(Urea) per 1 liter</Label>
                                        <NumericFormat 
                                            value={formik.values.urea_per_liter} 
                                            onValueChange={(values)=>formik.setFieldValue("urea_per_liter", values.value)}
                                            customInput={Input} 
                                            thousandSeparator 
                                            className="pr-10 w-full col-span-3" 
                                            decimalScale={0}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label>Konsentrasi(MKP) per 1 liter</Label>
                                        <NumericFormat 
                                            value={formik.values.mkp_per_liter} 
                                            onValueChange={(values)=>formik.setFieldValue("mkp_per_liter", values.value)}
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
                                            <Plus/> Tambahkan
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

