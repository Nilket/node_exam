export async function fetchGet(endpoint){
    try{
         const response = await fetch(`${import.meta.env.VITE_BASE_URL}${endpoint}`, {
        credentials: 'include'
    });
    
    const data = await response.json();

    if(!response.ok) {
        throw new Error(data.message || "Fetch get went wrong");
    }

    return data;
    } catch(error){
        console.log(error);
    }
}

export async function fetchPost(endpoint, body) {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}${endpoint}`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();

            if(!response.ok){
                throw new Error(data.message || "Something went wrong");
            }
            return data;

}