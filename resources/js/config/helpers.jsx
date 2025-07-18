import { addDays, format } from "date-fns"
import * as _ from "underscore"

export const countMonth=(date_start, date_end, with_one=false)=>{

    const date1=new Date(date_start)
    const date2=new Date(date_end)

    const year1=date1.getFullYear()
    const year2=date2.getFullYear()

    const month1=date1.getMonth()
    const month2=date2.getMonth()

    const diff=((year2-year1)*12)+(month2-month1)

    return with_one?diff+1:diff
}

export const options_lahan=(data)=>{
    const options=data.map(d=>({label:d.nama_lahan, value:d.id, data:d}))

    return [{label:"Pilih Lahan", value:""}].concat(options)
}

export const fase_pertumbuhan=(data)=>{
    if(_.isNull(data.usia_tanaman)){
        return {
            fase:"",
            ideal_n:null,
            ideal_p:null,
            ideal_k:null,
            rasio_n:null,
            rasio_p:null,
            rasio_k:null
        }
    }

    if(data.usia_tanaman<=6){
        return {
            fase:"awal",
            ideal_n:0.4,
            ideal_p:25,
            ideal_k:0.3,
            rasio_n:2,
            rasio_p:1,
            rasio_k:1
        }
    }
    if(data.usia_tanaman<=18){
        return {
            fase:"vegetatif",
            ideal_n:0.35,
            ideal_p:20,
            ideal_k:0.3,
            rasio_n:2,
            rasio_p:1,
            rasio_k:2
        }
    }
    if(data.usia_tanaman<=30){
        return {
            fase:"generatif",
            ideal_n:0.3,
            ideal_p:25,
            ideal_k:0.4,
            rasio_n:1,
            rasio_p:2,
            rasio_k:2
        }
    }
    if(data.usia_tanaman>30){
        return {
            fase:"produksi",
            ideal_n:0.25,
            ideal_p:30,
            ideal_k:0.5,
            rasio_n:1,
            rasio_p:2,
            rasio_k:3
        }
    }
}

export const data_fase=[
    {
        fase:"awal",
        ideal_n:0.4,
        ideal_p:25,
        ideal_k:0.3,
        rasio_n:2,
        rasio_p:1,
        rasio_k:1
    },
    {
        fase:"vegetatif",
        ideal_n:0.35,
        ideal_p:20,
        ideal_k:0.3,
        rasio_n:2,
        rasio_p:1,
        rasio_k:2
    },
    {
        fase:"generatif",
        ideal_n:0.3,
        ideal_p:25,
        ideal_k:0.4,
        rasio_n:1,
        rasio_p:2,
        rasio_k:2
    },
    {
        fase:"produksi",
        ideal_n:0.25,
        ideal_p:30,
        ideal_k:0.5,
        rasio_n:1,
        rasio_p:2,
        rasio_k:3
    }
]