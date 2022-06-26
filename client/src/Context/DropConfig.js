import React, { Component, createContext } from 'react';

export const DropConfigContext = createContext();

class DropConfigProvider extends Component {
    state = {
        content:{
            title: "title",
            info: "info",
            artist: "artist",
            price: "10000000000000000000",
            currency: "ASH",
            chainId: 1,
            dropDate: "09 Mar 2022 15:00:00 GMT",
            dropEnd: "11 Mar 2022 15:00:00 GMT",
            interactiveContracts:{
                numOfContracts: 1,
                1:{
                    "contractAddress":"0xblablabla",
                    "chainId": 1
                }
            }
        },
        parameters:{
            1:{
                "name": "name1",
                "type": "string",
                "value": "value"
            },
            2:{
                "name": "name2",
                "type": "integer",
                "value": "value"
            }
        },
        banner:{
            exists: true,
            url: "https://cdn.pixabay.com/photo/2015/10/29/14/38/web-1012467_1280.jpg",
            height: "20vh",
            width: "100vw"
        },
        background:{
            exists: false,
            url: "https://png.pngtree.com/background/20210712/original/pngtree-modern-double-color-futuristic-neon-background-picture-image_1181573.jpg",
            position: "center",
            repeat: "no-repeat",
            size: "contain",
            height: 100,
            width: 100,
            color: "#ffffff"
        },
        font:{
            title: {
                "font-style": "url",
                "font-color": "#4287f5"
            },
            content:{
                "font-style": "url",
                "font-color": "#4287f5"
            }
        }
    }

    render(){
        return(
            <DropConfigContext.Provider 
            value={{
                ...this.state, 
                }}>
                {this.props.children}
            </DropConfigContext.Provider>
        )
    }

}
export default DropConfigProvider;