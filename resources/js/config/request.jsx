import axios from "axios"


//MODBUS SERVER REQUEST
export const modbus_server_request={
    connect:async(uri, params={})=>{
        return await axios.post(uri+"/connect", 
            params, 
            {
                headers:{"Content-Type":"application/json"}
            }
        )
        .then(res=>res.data)
    },
    data_sensor:async(uri, params={})=>{
        return await axios.get(uri+"/data_sensor", {
            params:params
        })
        .then(res=>res.data)
    },
    close_connect:async(uri, params={})=>{
        return await axios.delete(uri+"/close_connect", {
            params:params
        })
        .then(res=>res.data)
    }
}

//EWS
export const ews_request={
    region:async(uri, params={})=>{
        return await axios.get(uri+"/api/frontpage/region/type/all", 
            params, 
            {
                headers:{"Content-Type":"application/json"}
            }
        )
        .then(res=>res.data)
    },
}

//MODBUS SENSOR
export const modbus_sensor_request={
    gets:async(params={})=>{
        return await axios.get("/api/modbus_sensor", {
            params:params
        })
        .then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/modbus_sensor/${id}`).then(res=>res.data)
    },
    add:async(params)=>{
        return await axios.post("/api/modbus_sensor", params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/modbus_sensor/${id}`).then(res=>res.data)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/modbus_sensor/${id}`, params).then(res=>res.data)
    }
}

//LAHAN
export const lahan_request={
    gets:async(params={})=>{
        return await axios.get("/api/lahan", {
            params:params
        })
        .then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/lahan/${id}`).then(res=>res.data)
    },
    add:async(params)=>{
        return await axios.post("/api/lahan", params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/lahan/${id}`).then(res=>res.data)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/lahan/${id}`, params).then(res=>res.data)
    }
}

//LAHAN DETAIL
export const lahan_detail_request={
    gets:async(params={})=>{
        return await axios.get("/api/lahan_detail", {
            params:params
        })
        .then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/lahan_detail/${id}`).then(res=>res.data)
    },
    get_last:async(params={})=>{
        return await axios.get(`/api/lahan_detail/type/last`, {
            params:params
        })
        .then(res=>res.data)
    },
    add:async(params)=>{
        return await axios.post("/api/lahan_detail", params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/lahan_detail/${id}`).then(res=>res.data)
    },
    update:async(id, params)=>{
        return await axios.put(`/api/lahan_detail/${id}`, params).then(res=>res.data)
    }
}

//PUPUK
export const pupuk_request={
    gets:async(params={})=>{
        return await axios.get("/api/pupuk", {
            params:params
        })
        .then(res=>res.data)
    },
    get:async(id)=>{
        return await axios.get(`/api/pupuk/${id}`).then(res=>res.data)
    },
    add:async(params)=>{
        return await axios.post("/api/pupuk", params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/pupuk/${id}`).then(res=>res.data)
    },
    simulate_rabuk:async(params)=>{
        return await axios.post("/api/pupuk/simulate_rabuk", params).then(res=>res.data)
    },
    simulate_time:async(params)=>{
        return await axios.post("/api/pupuk/simulate_time", params).then(res=>res.data)
    },
    simulate_weight:async(params)=>{
        return await axios.post("/api/pupuk/simulate_weight", params).then(res=>res.data)
    },
}