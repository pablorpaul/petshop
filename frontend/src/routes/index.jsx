import { Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import PrivateRoute from './PrivateRoute'
import Pets from '../pages/Pets'
import Owners from '../pages/Owners'

function AppRoutes(){
    return(
        <Routes>
            <Route path='/' element= {<Login/>}/>
            <Route path='/dashboard' element= {
                <PrivateRoute>
                    <Dashboard />
                </PrivateRoute>
            }/>
            <Route path='/pets' element= {
                <PrivateRoute>
                    <Pets />
                </PrivateRoute>
            }/>
            <Route path='/owners' element= {
                <PrivateRoute>
                    <Owners />
                </PrivateRoute>
            }/>
                
        </Routes>
    )
}

export default AppRoutes