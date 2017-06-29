const app = {
    onmatch(attrs) {
        attrs.types = []
        m.request({
            url: "/graphql",
            method: 'POST',
            data: {
                query: `query te($project:String){
                    Project(_id:$project){
                        Types {
                          _id
                          name
                        }
                    }
                  
                }`,
                variables:JSON.stringify({
                    project:attrs.project
                })
            }
        }).then(res => {
            attrs.types = res.data.Project.Types
            m.redraw()
        })
    },
    render: (vnode) => m({
        view: () => m('.app', [
            m("a", {
                href: `/addType/${vnode.attrs.project}`,
                oncreate: m.route.link,
                onupdate: m.route.link
            }, "Add types"),
            m("a", {
                href: `/graphql2/${vnode.attrs.project}`,
                target: '_blank'
            }, "Test on graphiql"),
            m("a", {
                href: `/`,
                oncreate: m.route.link,
                onupdate: m.route.link,
                target: '_blank'
            }, "Back"),
            m("br"),
            m("br"),
            vnode.attrs.types.map(type => {
                return [m("a", {
                        href: `/type/${type._id}`,
                        oncreate: m.route.link,
                        onupdate: m.route.link
                    }, type.name),
                    m("br")
                ]
            })
        ])
    })
}


const props = {
    onmatch(attrs) {
        attrs.props = []
        m.request({
            url: "/graphql",
            method: 'POST',
            data: {
                query: `query te($_id:String){
                  Type(_id:$_id) {
                    Props{
                        _id,
                        name
                    }
                  }
                }`,
                variables: JSON.stringify({
                    _id: attrs.type_id
                })
            }
        }).then(res => {
            console.log(res)
            attrs.props = res.data.Type.Props
            m.redraw()
        })
    },
    render: (vnode) => m({
        view: () => m('.app', [
            console.log(vnode),
            m("a", {
                href: `/addProps/${m.route.param("type_id")}`,
                oncreate: m.route.link,
                onupdate: m.route.link
            }, "Add prop"),
            m("a", {
                href: `/`,
                oncreate: m.route.link,
                onupdate: m.route.link
            }, "Back"),
            vnode.attrs.props.map(type => {
                console.log(type)
                return [
                    m("br"),
                    m("a", type.name)
                ]
            })
        ])
    })
}

const projects = {
    onmatch(attrs) {
        attrs.Projects = []
        m.request({
            url: "/graphql",
            method: 'POST',
            data: {
                query: `query te{
                  Projects {
                    _id,
                    name
                  }
                }`
            }
        }).then(res => {
            console.log(res)
            attrs.Projects = res.data.Projects
            m.redraw()
        })
    },
    render: (vnode) => m({
        view: () => m('.app', [
            console.log(vnode),
            m("a", {
                href: `/addProject`,
                oncreate: m.route.link,
                onupdate: m.route.link
            }, "Add Project"),
            m("br"),
            vnode.attrs.Projects.map(type => {
                return [
                    m("br"),
                    m("a", {
                        href: `/types/${type._id}`,
                        oncreate: m.route.link,
                        onupdate: m.route.link
                    }, type.name),
                ]
            })
        ])
    })
}


const addprops = {
    onmatch(attrs) {
        attrs.types = []
        m.request({
            url: "/graphql",
            method: 'POST',
            data: {
                query: `query te(id:String){
                  Types {
                       _id
                       name
                  }
                }`
            }
        }).then(res => {
            attrs.types = res.data.Types
            m.redraw()
        })
        attrs.name = ""
        attrs.required = false
        attrs.list = false
        attrs.basicTypes = ['Int', 'String', 'Boolean', 'Float']
        attrs.addType = ['Scalar', 'InType']
        attrs.Type = "String"
        attrs.selectedType = "Scalar"
        attrs.description = ""
    },
    render: (mamaVnode) => m({
        view: (vnode) => m('.app', [
            m("a", {
                href: `/type/${m.route.param("type_id")}`,
                oncreate: m.route.link,
                onupdate: m.route.link
            }, "Back"),
            m("br"),
            m("form", {
                onsubmit() {
                    m.request({
                        url: "/graphql",
                        method: 'POST',
                        data: {
                            query: `mutation te($name:String,$Parent:String,$Type:String,$list:Boolean,$required:Boolean,$description:String){
                              addProp(name:$name,Parent:$Parent,Type:$Type,list:$list,required:$required,description:$description)
                            }`,
                            variables: JSON.stringify({
                                name: mamaVnode.attrs.name,
                                Parent: m.route.param('type_id'),
                                Type: mamaVnode.attrs.Type,
                                required: mamaVnode.attrs.required,
                                list: mamaVnode.attrs.list,
                                description: mamaVnode.attrs.description
                            })
                        }
                    }).then(res => {
                        vnode.state.types = res.data.Types
                        m.redraw()
                        m.route.set(`/type/${m.route.param("type_id")}`)
                    }).catch(alert)
                }
            }, [
                m("input", {
                    placeholder: "Prop Name",
                    onchange: m.withAttr('value', v => mamaVnode.attrs.name = v),
                    value: mamaVnode.attrs.name
                }),
                m('select', {
                    onchange: (e) => {
                        mamaVnode.attrs.selectedType = e.target.value
                    }
                }, [
                    mamaVnode.attrs.addType.map(type => m('option', {
                        value: type,
                        selected: type == mamaVnode.attrs.selectedType ? true : false
                    }, type))
                ]),

                m('br'),

                mamaVnode.attrs.selectedType === 'Scalar' ? "" : m('select', {
                    onchange: (e) => {
                        mamaVnode.attrs.Type = e.target.value
                    }
                }, [
                    mamaVnode.attrs.types.map(type => m('option', { 
                        value: type.name,
                        selected: type.name == mamaVnode.attrs.Type ? true : false
                    }, type.name))
                ]),


                mamaVnode.attrs.selectedType === 'InType' ? "" : m('select', {
                    onchange: (e) => {
                        mamaVnode.attrs.Type = e.target.value
                    }
                }, [
                    mamaVnode.attrs.basicTypes.map(type => m('option', {
                        value: type,
                        selected: type == mamaVnode.attrs.Type ? true : false
                    }, type))
                ]),

                m('p', 'options'),

                m("input", {
                    type: "checkbox",
                    id: "required",
                    onchange: m.withAttr('checked', v => mamaVnode.attrs.required = v),
                    checked: mamaVnode.attrs.required
                }),
                m('label', {
                    for: "required"
                }, "required"),
                m("br"),


                m("input", {
                    type: "checkbox",
                    id: "list",
                    onchange: m.withAttr('checked', v => mamaVnode.attrs.list = v),
                    checked: mamaVnode.attrs.list
                }),
                m('label', {
                    for: "list"
                }, "list"),
                m("br"),

                m("input", {
                    placeholder: "Prop description",
                    onchange: m.withAttr('value', v => mamaVnode.attrs.description = v),
                    value: mamaVnode.attrs.description
                }),

                m("button", {
                    type: "submit"
                }, "save")
            ])
        ])
    })
}

const addTypes = {
    oninit(vnode) {
        vnode.state.name = ""
        vnode.state.description = ""
    },
    view: (vnode) => m('.app', [
        m("a", {
            href: `/`,
            oncreate: m.route.link,
            onupdate: m.route.link
        }, "back"),
        m("form", {
            onsubmit() {
                m.request({
                    url: "/graphql",
                    method: 'POST',
                    data: {
                        query: `mutation te($name:String,$Project:String!,$description:String){
                              addType(name:$name,Project:$Project,description:$description)
                            }`,
                        variables: JSON.stringify({
                            name: vnode.state.name,
                            Project:vnode.attrs.project,
                            description: vnode.state.description,
                        })
                    }
                }).then(res => {
                    vnode.state.types = res.data.Types
                    m.route.set(`/types/${vnode.attrs.project}`)
                    m.redraw()
                })
            }
        }, [
            m("input", {
                placeholder: "name",
                oninput: m.withAttr('value', v => vnode.state.name = v),
                value: vnode.state.name
            }),
            m("input", {
                placeholder: "Prop description",
                onchange: m.withAttr('value', v => vnode.state.description = v),
                value: vnode.state.description
            }),
            m("button", {
                type: "submit"
            }, "save")
        ])
    ])
}


const addProject = {
    oninit(vnode) {
        vnode.state.name = ""
        vnode.state.description = ""
    },
    view: (vnode) => m('.app', [
        m("a", {
            href: `/`,
            oncreate: m.route.link,
            onupdate: m.route.link
        }, "back"),
        m("form", {
            onsubmit() {
                m.request({
                    url: "/graphql",
                    method: 'POST',
                    data: {
                        query: `mutation te($name:String,$description:String){
                              addProject(name:$name,description:$description)
                            }`,
                        variables: JSON.stringify({
                            name: vnode.state.name,
                            description: vnode.state.description,
                        })
                    }
                }).then(res => {
                    vnode.state.types = res.data.Types
                    m.route.set("/")
                    m.redraw()
                })
            }
        }, [
            m("input", {
                placeholder: "Name",
                oninput: m.withAttr('value', v => vnode.state.name = v),
                value: vnode.state.name
            }),
            m("input", {
                placeholder: "Project description",
                onchange: m.withAttr('value', v => vnode.state.description = v),
                value: vnode.state.description
            }),
            m("button", {
                type: "submit"
            }, "save")
        ])
    ])
}


m.route(document.body, "/", {
    "/":projects,
    "/addProject":addProject,
    "/types/:project": app,
    "/addType/:project": addTypes,
    "/type/:type_id": props,
    "/addProps/:type_id": addprops
})
