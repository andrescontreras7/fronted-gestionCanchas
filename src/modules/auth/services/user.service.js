import { authenticatedApiCall } from "@/shared/services"



export const usersAuthService = {
  async getAllUsers() {
   const response = await authenticatedApiCall('/admin/users', {
         method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            },
       })


       console.log('Usuarios obtenidos:', response)
       return response
  }





}