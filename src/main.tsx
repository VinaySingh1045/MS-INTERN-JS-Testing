import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import MainPage from './components/MainPage.tsx'
import { Provider } from 'react-redux'
import { store } from './redux/store.ts'
import Login from './components/auth/Login.tsx'
import Profile from './components/profile/Profile.tsx'
import { ConfigProvider } from 'antd'
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <MainPage />
      },
      {
        path:"/profile",
        element:<Profile/>
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  // <StrictMode>

  <Provider store={store}>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#c9194b',
          borderRadius: 14,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  </Provider>

  // </StrictMode> 
)
