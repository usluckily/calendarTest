/**
 * Created by Administrator on 2017/7/6.
 */
var subApi = '/mealsManage_listMeals.do?method=updateUserEatMealStatusByMonth' , //date userid sid
    getInitInfo = '/mealsManage_listMeals.do?method=getMealsByMonth' //sid userid date(yy-mm)


var vm = new Vue({
    el:'.calendar_box',
    data:{
        show:false,
        monthList:['1','2','3','4','5','6','7','8','9','10','11','12'],
        tObj:{
            X:0,
            Y:0,
            NX:0,
            NY:0,
            dev:0,
            up:0
        },
        years:new Date().getFullYear(),
        month:new Date().getMonth()+1,
        days:new Date().getDate(),
        localmonth:(new Date().getMonth()+1) < 10 ? '0'+(new Date().getMonth()+1) : (new Date().getMonth()+1),
        localdays:new Date().getDate() <10 ? '0'+new Date().getDate() : new Date().getDate(),
        choosemonth:'',
        test:0,
        weekSelect:false,//判断周末是否可选
        selectArrFromServices:[],//第一次从服务端获取到的已被选择的日期
        localSelectarr:[],//本地记录，方便更改的
        status:{
            cancel:[],
            select:[]
        },
        testTxt:'',
    },
    methods:{
        beforeEnter:function(el){

        },
        enter(el){

        },
        isInArr(c,a){
            let state = false , len = a.length;
            for(var i = 0;i<len;i++){
                c == a[i] ? state = true : '';
            }
            return state;
        },
        changeStatus(el,index){
            var dataset = el.target.dataset , vm = this
            if(dataset.canselect){
                if(dataset.lock == 0){

                    vm.localSelectarr.push( (index+1) )

                    vm.status.select.push()

                }else{
                    for(var i in vm.localSelectarr){
                        if(vm.localSelectarr[i] == (index+1)){
                            vm.localSelectarr.splice(i, 1)
                        }
                    }
                }

            }else{
                return
            }
        },
        monthsDaysFac(years,month,days,testArr){
            var checkWeekend , res = [] , className = '' , isWeekend , select ,  vm = this , isDefault , canSelect //onSelect 判断是否允许选中

            for(var i=0;i<days;i++){
                checkWeekend = new Date(years,month-1,(i+1)).getDay() //month减一

                isDefault = vm.isInArr( (i+1),testArr)

                if(vm.choosemonth < vm.month  || vm.choosemonth > (vm.month+2) || ( i < vm.days && vm.choosemonth == vm.month)){ //划掉小于当前日期的和大于当前两个月的
                    className = 's_cancel'
                    canSelect = false
                    select = 0
                }else if( (checkWeekend == 0 || checkWeekend == 6) && !vm.weekSelect){ //在不能选择周末时划掉周末的
                    className = 's_cancel'
                    isWeekend = true
                    canSelect = false
                    select = 0
                }else if(isDefault){ //划掉后台传递的已选中的
                    className = 's_selected'
                    canSelect = true
                    select = 1
                }else{
                    className = 's_normal'
                    isWeekend = false
                    canSelect = true
                    select = 0
                }

                res.push({
                    days:i + 1,
                    className:className,
                    isWeekend:isWeekend,
                    week:checkWeekend,
                    canSelect:canSelect,
                    select:select
                })
            }
            return res
        },
        sub(){
            var vm = this , str = ''
            console.log(vm.localSelectarr)
            for(var i=0 ; i<vm.localSelectarr.length ; i++){
                i < vm.localSelectarr.length - 1 ?
                    str+=vm.years+'-'+vm.localmonth+'-'+(vm.localSelectarr[i] < 10 ? '0'+vm.localSelectarr[i] : vm.localSelectarr[i])+',' :
                    str+=vm.years+'-'+vm.localmonth+'-'+(vm.localSelectarr[i] < 10 ? '0'+vm.localSelectarr[i] : vm.localSelectarr[i])
            }
            console.log(str)
            $.ajax({
                url:subApi,
                data:{userid:'467310497',sid:'143',date:str,eatflag:'Y'},
                type:"GET",
                success(d){
                    console.log(d)

                    vm.show = false

                }
            })
        }
    },
    computed:{
        monthsDays(){
            var vm = this , res2  = [], years = new Date().getFullYear() , checkWeekend , days //testArr为测试的默认选中日期

            switch(vm.choosemonth){
                case 1: case 3: case 5: case 7: case 8: case 10: case 12:
                days = 31
                res2 = vm.monthsDaysFac(vm.years,vm.choosemonth,days ,vm.localSelectarr)
                break;
                case 4: case 6: case 9: case 11:
                days = 30
                res2 = vm.monthsDaysFac(vm.years,vm.choosemonth,days,vm.localSelectarr)
                break;
                case 2:
                    if(years%400 == 0 || ( years%4 == 0 && years%100 != 0 ) ){
                        days = 29
                    }else{
                        days = 28
                    }
                    res2 = vm.monthsDaysFac(vm.years,vm.choosemonth,days,vm.localSelectarr)
            }
            return res2
        }

    },
    filters:{

    },
    created(){
        var vm = this
        $.ajax({
            url:getInitInfo,
            data:{userid:'467310497',sid:'143',date:vm.years+'-'+(vm.month<10?'0'+vm.month:vm.month)},
            type:"GET",
            success(d){
                console.log(d)
            }
        })
        this.localSelectarr = this.localSelectarr.concat(this.selectArrFromServices)
    },
    mounted(){
        var vm = this , x = 0 , itemH = 28, month = vm.month , initTop = (month-3)*itemH , max = month*itemH - itemH , min = (month - vm.monthList.length)*itemH

        vm.choosemonth = month

        $('.second-scroll-box').css({'top':-initTop+'px'})


        $('.item-scroll-box').on('touchstart mousedown',function(e){

            e.preventDefault()

            vm.tObj.X = e.clientX || e.originalEvent.targetTouches[0].pageX;
            vm.tObj.Y = e.clientY || e.originalEvent.targetTouches[0].pageY;

            $('.second-scroll-box').removeClass('trans')

            $('.item-scroll-box').on('touchmove mousemove',function(e){


                vm.tObj.NX = e.clientX || e.originalEvent.targetTouches[0].pageX;
                vm.tObj.NY = e.clientY || e.originalEvent.targetTouches[0].pageY;

                if(vm.tObj.dev > max){
                    vm.tObj.dev = vm.tObj.dev--
                }else if(vm.tObj.dev < min){
                    vm.tObj.dev = vm.tObj.dev++
                }else{
                    vm.tObj.dev = vm.tObj.NY - vm.tObj.Y + vm.tObj.up
                }

                $('.second-scroll-box').css({'transform':'translate3d(0px,'+vm.tObj.dev+'px,0px)'})

                console.log(max)



            })

            $('.item-scroll-box').on('touchend mouseup',function(e){



                vm.test = vm.tObj.dev / itemH

                vm.choosemonth = month - Math.round(vm.tObj.dev / itemH)

//                    if(vm.tObj.dev > max){
//                        vm.tObj.dev = max - 1
//                    }else if(vm.tObj.dev < min){
//                        vm.tObj.dev = min + 1
//                    }

                vm.tObj.up = vm.tObj.dev = (month - vm.choosemonth)*itemH



//                    if(vm.tObj.dev >= max){
//                        $('.second-scroll-box').css({'transform':'translate3d(0px,'+vm.tObj.dev - 38+'px,0px)'})
//                    }else{
//                        $('.second-scroll-box').css({'transform':'translate3d(0px,'+(month - vm.choosemonth)*itemH+'px,0px)'})
//                    }

                $('.second-scroll-box').css({'transform':'translate3d(0px,'+vm.tObj.dev+'px,0px)'})

                $('.second-scroll-box').addClass('trans')

                $('.item-scroll-box').unbind('touchmove mousemove')
                $('.item-scroll-box').unbind('touchend mouseup')


                //
                vm.localSelectarr.splice(0,vm.localSelectarr.length)
                vm.localSelectarr = vm.localSelectarr.concat(vm.selectArrFromServices)
            })

        })

    }
})
