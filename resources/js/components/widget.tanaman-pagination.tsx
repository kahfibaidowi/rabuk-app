import React from 'react'
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
import { ArrowRight, ChevronLeft, ChevronLeftIcon, ChevronRightIcon, ChevronsLeft, ChevronsLeftIcon, ChevronsRightIcon, Edit2, Ellipsis, LoaderCircle, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import _ from "underscore"
import { Label } from '@/components/ui/label'

const TanamanPagination=(props)=>{
    const goToPage=page=>{
        props.setFilter(
            Object.assign({}, props.filter, {
                page:page
            })
        )
    }
    const typeFilter=e=>{
        const target=e.target

        if(target.name=="q"){
            if(timeout) clearTimeout(timeout)
            timeout=setTimeout(()=>{
                props.setFilter(
                    Object.assign({}, props.filter, {
                        [target.name]:target.value,
                        page:1
                    })
                )
            }, 500)
        }
        else{
            props.setFilter(
                Object.assign({}, props.filter, {
                    [target.name]:target.value,
                    page:1
                })
            )
        }
    }
    let timeout=0

    return (
        <>
            <div className="flex -mx-3 flex-wrap">
                {(props.dataSource.isFetching)?
                    <div className='flex justify-center items-center px-4'>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        <span className='text-muted-foreground ml-2'>Loading...</span>
                    </div>
                :
                    <>
                        {!_.isNull(props.dataSource.error)?
                            <div className='flex justify-center items-center px-4'>
                                <span 
                                    className='flex items-center justify-center text-muted-foreground'
                                    onClick={e=>props.refreshData()}
                                >
                                    Failed Load Data! &nbsp; <RefreshCw size={15}/>
                                </span>
                            </div>
                        :
                            <>
                                {props.dataSource.data.data.length==0&&
                                    <div className='flex justify-center items-center px-4'>
                                        <span className='flex items-center justify-center text-muted-foreground'>Data tidak ditemukan!</span>
                                    </div>
                                }

                                {props.dataSource.data.data.map((list, idx)=>(
                                    <>{props.renderItem(list)}</>
                                ))}
                            </>
                        }
                    </>
                }
            </div>
            
            {(!props.dataSource.isFetching)&&
                <>
                    {_.isNull(props.dataSource.error)&&
                        <>
                            {props.dataSource.data.data.length>0&&
                                <div className="flex items-center justify-between">
                                    <div className="flex w-full items-center gap-8 lg:w-fit ml-auto">
                                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                                            Page {props.dataSource.data.current_page} of {props.dataSource.data.last_page} ({props.dataSource.data.total} data)
                                        </div>
                                        <div className="ml-auto flex items-center gap-1 lg:ml-0">
                                            <Button
                                                variant="outline"
                                                className="size-8"
                                                size="icon"
                                                onClick={()=>goToPage(props.dataSource.data.current_page-1)}
                                                disabled={props.dataSource.data.current_page<=1}
                                            >
                                                <span className="sr-only">Go to previous page</span>
                                                <ChevronLeftIcon />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="size-8"
                                                size="icon"
                                                onClick={()=>goToPage(props.dataSource.data.current_page+1)}
                                                disabled={props.dataSource.data.current_page>=props.dataSource.data.last_page}
                                            >
                                                <span className="sr-only">Go to next page</span>
                                                <ChevronRightIcon />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </>
                    }
                </>
            }
        </>
    )
}

export default TanamanPagination