import React, { Component } from 'react'
import ListMassage from './ListMassage'
import Global from '../../Global';
import Axios from 'axios'
import Moment from 'moment'
import JWT from '../../Class/JWT';
import Identificador from '../../Class/Identificador';

export default class Mensajes extends Component {

    constructor(props) {
        super(props);
        this.connectSocket = Global.ConnectChat

    }

    state = {
        mensajes: []
    }

    sendMessage = (message) => {

        const params = {
            latestChatTime: Moment().format(),
            latestChatMessage: message.info.foto !== null ? 'imagen' : message.info.message,
            typeAcount: Identificador.validatorIdentificador(),
            id: message.id
        }

        const headers = {
            authorization: `Bearer ${JWT.getJWT()}`
        }

        Axios.put(Global.servidor + "updateChatDocente", params, { headers })
            .then((response) => {
                this.connectSocket.emit("sendMensajes", message);

                const sending = {
                    message: params.latestChatMessage,
                    image: message.info.foto != null ? message.info.foto : null,
                    id: Identificador.validatorIdentificador() ? null : params.id
                }

                Axios.post(Global.servidor + "sendNotification", sending, { headers }).then((resp) => {

                })
                    .catch((err) => {
                        console.error(err)
                    })

            })
            .catch((err) => {
                console.log(err);
            })
        this.props.clear('')
    }

    seacrhMessage = () => {
        this.connectSocket.emit("requestMessage", this.props.id)
    }

    UNSAFE_componentWillMount() {
        this.seacrhMessage()
        this.connectSocket.on("recivedMensajes", (data) => {

            let scrol = false

            if (this.state.mensajes.length !== data.length) {
                scrol = true
            }

            this.setState({
                mensajes: data
            })

            if (scrol) {
                var objDiv = document.querySelector(".messages-list");
                objDiv.scrollTop = objDiv.scrollHeight;
            }

            scrol = false;

        })

        this.connectSocket.on("searchMSG", (data) => {
            this.seacrhMessage()
        })
    }

    componentDidUpdate() {
        this.seacrhMessage()
    }

    render() {
        const ListData = this.state.mensajes.map((data, i) => {
            return <ListMassage mensaje={data} image={this.props.image} key={i}></ListMassage>
        })

        if (this.props.data.id) {
            this.sendMessage(this.props.data)
        }

        return (
            ListData
        )
    }

}