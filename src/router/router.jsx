import { createBrowserRouter } from "react-router";
import RootLayout from "../Layouts/RootLayout";
import LandTaxForm from "../Pages/LandTaxForm/LandTaxForm";
import LandReceipt from "../Pages/LandReceipt/LandReceipt";


const router=createBrowserRouter([
    {
        path:'/',
        Component:RootLayout,
        children:[
            {
               index:true,
               Component:LandTaxForm
            },
            {
               path:'/receipt/:id',
               Component:LandReceipt
            }
        ]
    }
])
export default router;