import { apiRequest } from "@/lib/api.mjs";
import "./pedidos.css";


export default function Pedidos() {

const [pedidos, setPedidos] = useState([]);
const [carregando, setCarregando] = useState(true);
const [erro, setErro] = useState("");

useEffect(() => {
    let ativo = true;

    Promise.all([ 
        apiRequest("eventos?limite=100"),
        apiRequest("categorias?limite=100"),
    ])
    .then(([respostaPedidos]) => {
        if (!ativo) return;
        setPedidos(respostaPedidos.dados);
    })
    .catch((erroApi) => {
        if (ativo) setErro(erroApi.message);
    })
    .finally(() => {
        if (ativo) setCarregando(false);
    });
        

return () => {
        ativo = false;
    };
}, []);

const locais = [...new Set(pedidos.map((pedido) => pedido.local_nome).filter(Boolean))]




    return (

    <>
    <h1>Meus pedidos</h1>
    <h4>Consulte as suas compras e faça a gestão dos seus bilhetes</h4>




    </>
    );
};