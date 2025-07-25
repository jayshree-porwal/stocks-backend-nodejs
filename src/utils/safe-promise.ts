async function promiseRunner(promise?: Promise<any>) {
    try {
        const data: any = await promise;
        return [null, data];
    } catch (err) {
        return [err];
    }
}
  
export default promiseRunner;