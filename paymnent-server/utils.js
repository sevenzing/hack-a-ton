const sleep = (milliseconds) => {  
    return new Promise(resolve => setTimeout(resolve, milliseconds));  
}


const try_until_success = async (job, job_name, times = 20, sleep_time=1000) => {
    console.log("start job with name = ", job_name)
    for (let index = 0; index < times; index++) {
        let v = await job()
            .catch((e) => {
                console.log("attemt#", index, ". error!", "job name = ", job_name)
            })
        if (v != undefined) {
            console.log('job', job_name, 'finished with result =', v)
            return v
        }
        await sleep(sleep_time)
    }
}

module.exports = {
    sleep, try_until_success
}