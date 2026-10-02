import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import './Login.css';
import MediaPreview from '../components/MediaPreview';
import {siteMedia} from '../api';

export default function Login() {
  const d = useDispatch(), nav = useNavigate(), s = useSelector(x => x.auth);
  const [e, setE] = useState(""), [p, setP] = useState("");
  const [logo,setLogo]=useState('');
  useEffect(()=>{siteMedia.list().then(r=>setLogo((r?.data?.data||[]).find(x=>x.key==='store-logo')?.mediaUrl||'')).catch(()=>{})},[]);
  useEffect(() => { if (s.token) nav("/admin", { replace: true }); }, [s.token, nav]);
  const submit = x => { x.preventDefault(); d({ type: "LOGIN_REQ", payload: { email: e, password: p } }); };
  return <div className="login"><form onSubmit={submit}>{logo&&<MediaPreview className="admin-login-logo" src={logo} alt="Logo Nhà kính công nghệ cao Đà Lạt"/>}<h1>Nhà kính công nghệ cao Đà Lạt</h1><p>Đăng nhập quản trị cửa hàng</p>
    <label>Email<input value={e} onChange={x => setE(x.target.value)} /></label>
    <label>Mật khẩu<input type="password" value={p} onChange={x => setP(x.target.value)} /></label>
    {s.error && <div className="error">{s.error}</div>}
    <button className="primary" disabled={s.loading}>{s.loading ? "Đang đăng nhập…" : "Đăng nhập"}</button>
  </form></div>;
}
