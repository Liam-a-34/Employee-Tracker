const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
    host: "localhost",
    post: process.env.PORT || 3001,
    user: "root",
    password: "liamallen34",
    database: "employee_db"
});

connection.connect(function(err){
    if(err) throw err;
    cli_prompt()
});

console.log(`
    ╔═══╗─────╔╗──────────────╔═╗╔═╗
    ║╔══╝─────║║──────────────║║╚╝║║
    ║╚══╦╗╔╦══╣║╔══╦╗─╔╦══╦══╗║╔╗╔╗╠══╦═╗╔══╦══╦══╦═╗
    ║╔══╣╚╝║╔╗║║║╔╗║║─║║║═╣║═╣║║║║║║╔╗║╔╗╣╔╗║╔╗║║═╣╔╝
    ║╚══╣║║║╚╝║╚╣╚╝║╚═╝║║═╣║═╣║║║║║║╔╗║║║║╔╗║╚╝║║═╣║
    ╚═══╩╩╩╣╔═╩═╩══╩═╗╔╩══╩══╝╚╝╚╝╚╩╝╚╩╝╚╩╝╚╩═╗╠══╩╝
    ───────║║──────╔═╝║─────────────────────╔═╝║
    ───────╚╝──────╚══╝─────────────────────╚══╝`)

const mainPrompt = [

    {
        name: "action",
        type: "list",
        message: "Select an action",
        choices: [
            "View employees",
            "View roles",
            "View departments",
            "Add department",
            "Add role",
            "Add employee",
            "Edit employee",
            "Remove employee",
            "EXIT"
        ]
    }
];

function cli_prompt() {
    inquirer.prompt(mainPrompt)
    .then(function(answer) {
        if(answer.action == "View employees") {
            viewAll();
        }else if (answer.action == "View departments") {
            viewDept();
        }else if (answer.action == "View roles") {
            viewRoles();
        }else if (answer.action == "Add employee") {
            addEmployee();
        }else if (answer.action == "Add department") {
            addDept();
        }else if (answer.action == "Add role") {
            addRole();
        }else if (answer.action == "Edit employee") {
            updateEmployee();
        }else if (answer.action == "Remove employee") {
            deleteEmployee();
        }else if(answer.action == "EXIT") {
            exit();
        };
    });
};

function viewAll() {
    let query = 
    `SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name AS department, employees.manager_id FROM employees JOIN roles ON roles.id = employees.role_id JOIN department ON roles.department_id = department.id ORDER BY employees.id;`
    ;

    connection.query(query, function(err, res) {
        if(err) throw err;

        for(i=0; i < res.length; i++){
            if(res[i].manager_id == 0) {
                res[i].manager = "None"
            }else{

                res[i].manager = res[res[i].manager_id - 1].first_name + " " + res[res[i].manager_id - 1].last_name;
            };

            delete res[i].manager_id;
        };

        console.table(res);

        cli_prompt();
    });
};

function viewDept() {
    let query = "SELECT department.dept_name AS departments FROM department;";

    connection.query(query, function(err, res) {

        if(err) throw err;

        console.table(res);

        cli_prompt();
    });
};

function viewRoles() {

    let query = "SELECT roles.title, roles.salary, department.dept_name AS department FROM roles INNER JOIN department ON department.id = roles.department_id;";

    connection.query(query, function(err, res) {
        
        if (err) throw err;

        console.table(res); 
        
        cli_prompt();

    });

};

function addEmployee() {

    let query = "SELECT title FROM roles";
    
    let query2 =

        "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name, employees.manager_id " +
        "FROM employees " +
        "JOIN roles ON roles.id = employees.role_id " +
        "JOIN department ON roles.department_id = department.id " +
        "ORDER BY employees.id;"

    ;

    connection.query(query, function(err, res){

        if (err) throw err;

        let rolesList = res;

        connection.query(query2, function(err,res) {
            
            if (err) throw err;

            for(i = 0; i < res.length; i++) {

                if(res[i].manager_id == 0) {
                    
                    res[i].manager = "None" 
                
                }else{

                    res[i].manager = res[res[i].manager_id - 1].first_name + " " + res[res[i].manager_id - 1].last_name;

                };

                delete res[i].manager_id;

            };

            console.table(res);

            let managerList = res;

            let addEmpPrompt = [

                {
            
                    name: "first_name",
                    type: "input",
                    message: "Enter new employee's first name."
                    
                },
            
                {
            
                    name: "last_name",
                    type: "input",
                    message: "Enter new employee's last name."
                    
                },
            
                {
            
                    name: "select_role",
                    type: "list",
                    message: "Select new employee's role.",

                    choices: function() {
                        
                        roles = [];
                        
                        for(i = 0; i < rolesList.length; i++) {
                            
                            const roleId = i + 1;

                            roles.push(roleId + ": " + rolesList[i].title);

                        };
                        
                        roles.unshift("0: Exit");

                        return roles;
            
                    }
                    
                },

                {
            
                    name: "select_manager",
                    type: "list",
                    message: "Select new employee's manager",
                    
                    choices: function() {
                        
                        managers = [];
            
                        for(i = 0; i < managerList.length; i++) {
                            
                            const mId = i + 1;

                            managers.push(mId + ": " + managerList[i].first_name + " " + managerList[i].last_name);
                            
                        };
                        
                        managers.unshift("0: None");

                        managers.unshift("E: Exit");

                        return managers;
            
                    },

                    when: function( answers ) {
                                
                        return answers.select_role !== "0: Exit";
                    
                    }
                    
                }
            
            ];
            
            inquirer.prompt(addEmpPrompt)

            .then(function(answer) {

                if(answer.select_role == "0: Exit" || answer.select_manager == "E: Exit") {

                    cli_prompt();

                }else{

                    console.log(answer);

                    let query = "INSERT INTO employees SET ?";

                    connection.query(query,
                    {

                        first_name: answer.first_name,
                        last_name: answer.last_name,
                        
                        role_id: parseInt(answer.select_role.split(":")[0]),

                        manager_id: parseInt(answer.select_manager.split(":")[0])

                    },
                    function(err, res){

                        if (err) throw err;
                    
                    })

                    let addagainPrompt = [

                        {
                    
                            name: "again",
                            type: "list",
                            message: "Would you like to add another employee?",
                            choices: ["Yes","Exit"]
                        
                        }

                    ];

                    inquirer.prompt(addagainPrompt)

                    .then(function(answer) {

                        let query =

                            "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name, employees.manager_id " +
                            "FROM employees " +
                            "JOIN roles ON roles.id = employees.role_id " +
                            "JOIN department ON roles.department_id = department.id " +
                            "ORDER BY employees.id;"

                        ;

                        connection.query(query, function(err,res) {
                
                            if (err) throw err;

                            if(answer.again == "Yes") {

                                addEmployee();
                            
                            }else if(answer.again == "Exit") {

                                for(i = 0; i < res.length; i++) {

                                    if(res[i].manager_id == 0) {
                                        
                                        res[i].manager = "None" 
                                    
                                    }else{

                                        res[i].manager = res[res[i].manager_id - 1].first_name + " " + res[res[i].manager_id - 1].last_name;

                                    };

                                    delete res[i].manager_id;

                                };

                                console.table(res);

                                cli_prompt(); 

                            };  

                        });

                    });  
                
                };

            });

        })

    })
    
};

function addDept() {

    
    let query = "SELECT department.dept_name FROM department;";

    connection.query(query, function(err, res){
        if (err) throw err;
        console.table(res);
        
        let addDeptPrompt = [

            {
        
                name: "new_department",
                type: "input",
                message: "Enter a new company department."
                
            },
        
        ];
        
        inquirer.prompt(addDeptPrompt)
        .then(function(answer) {
            console.log(answer);

            let query = "INSERT INTO department SET ?";
            
            connection.query(query,
            {
                dept_name: answer.new_department
            }, function(err, res){
                if (err) throw err;
            });
            
            let addagainPrompt = [

                {
        
                    name: "again",
                    type: "list",
                    message: "Would you like to add another department?",
                    choices: ["Yes","Exit"]
    
                },

            ];

            inquirer.prompt(addagainPrompt)

            .then(function(answer) {
                let query = "SELECT department.dept_name FROM department" ;
                connection.query(query, function(err, res){
                    if (err) throw err;
                    if(answer.again == "Yes") {

                        addDept();
                    }else if(answer.again == "Exit") {
                        console.table(res);
                        cli_prompt(); 

                    };  

                });

            });

        });

    });

};

function addRole() {
    let query1 = "SELECT roles.title AS roles, roles.salary, department.dept_name FROM roles INNER JOIN department ON department.id = roles.department_id;";
    let query2 = "SELECT department.dept_name FROM department" ;
    connection.query(query1, function(err, res){

        if (err) throw err;
        console.table(res);
        connection.query(query2, function(err,res) {
            
            if (err) throw err;
            let departmentList = res;
            let addRolePrompt = [

                {
            
                    name: "add_role",
                    type: "input",
                    message: "Enter a new company role."
                    
                },

                {
            
                    name: "add_salary",
                    type: "input",
                    message: "Enter a salary for this role."
                    
                },

                {
            
                    name: "select_department",
                    type: "list",
                    message: "Select a department.",

                    choices: function() {                       
                        departments = [];
                       
                        for(i = 0; i < departmentList.length; i++) { 
                            const roleId = i + 1;
                            departments.push(roleId + ": " + departmentList[i].dept_name);

                        };
                        
                        departments.unshift("0: Exit");

                        return departments;

                    }

                }
            
            ];
            
            inquirer.prompt(addRolePrompt)
            .then(function(answer) {

                if(answer.select_department == "0: Exit") {

                    cli_prompt();

                }else{

                    console.log(answer);

                    let query = "INSERT INTO roles SET ?";

                    connection.query(query,
                    {
                        title: answer.add_role,
                        salary: answer.add_salary,
                        
                        department_id: parseInt(answer.select_department.split(":")[0])

                    }, function(err, res){
                        if (err) throw err;
                        
                    });

                    let addagainPrompt = [

                        {
                
                            name: "again",
                            type: "list",
                            message: "Would you like to add another role?",
                            choices: ["Yes","Exit"]

                        },

                    ];
 
                    inquirer.prompt(addagainPrompt)

                    .then(function(answer) {

                        let query = "SELECT roles.id, roles.title AS roles, roles.salary, department.dept_name FROM roles INNER JOIN department ON department.id = roles.department_id;";

                        connection.query(query, function(err,res) {
                
                            if (err) throw err;

                            if(answer.again == "Yes") {

                                addRole();
                            
                            }else if(answer.again == "Exit") {
                                console.table(res);

                                cli_prompt(); 

                            };  

                        });

                    });
                
                };

            });

        });

    });
    
};

function updateEmployee() {

    let query = "SELECT title FROM roles";
    
    let query2 =

        "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name, employees.manager_id " +
        "FROM employees " +
        "JOIN roles ON roles.id = employees.role_id " +
        "JOIN department ON roles.department_id = department.id " +
        "ORDER BY employees.id;"

    ;

    connection.query(query, function(err, res){

        if (err) throw err;

        let rolesList = res;

        connection.query(query2, function(err,res) {
            if (err) throw err;
            for(i = 0; i < res.length; i++) {
                if(res[i].manager_id == 0) {
                    
                    res[i].manager = "None" 
                
                }else{
                    res[i].manager = res[res[i].manager_id - 1].first_name + " " + res[res[i].manager_id - 1].last_name;

                };
                delete res[i].manager_id;

            };

            console.table(res);

            let employeeList = res;

            let addEmpPrompt = [

                {
            
                    name: "select_employee",
                    type: "list",
                    message: "Select employee to edit",
                    
                    choices: function() {
                        
                        employees = [];
            
                        for(i = 0; i < employeeList.length; i++) {
                        
                            const mId = i + 1;

                            employees.push(mId + ": " + employeeList[i].first_name + " " + employeeList[i].last_name);
                            
                        };
                        
                        employees.unshift("0: Exit");

                        return employees;
            
                    }
                    
                }

            ];
            
            inquirer.prompt(addEmpPrompt)
            .then(function(answer) {

                if(answer.select_employee == "0: Exit") {

                    cli_prompt();

                }else{

                    let empSelect = answer.select_employee.split(":")[0]

                    let empPropPrompt = [
                
                        {
                    
                            name: "select_role",
                            type: "list",
                            message: "Edit employee role.",
        
                            choices: function() {
                                
                                roles = [];
                                
                                for(i = 0; i < rolesList.length; i++) {
                                    
                                    const roleId = i + 1;
        
                                    roles.push(roleId + ": " + rolesList[i].title);
        
                                };

                                roles.unshift("0: Exit");
                                
                                return roles;
                    
                            }
                            
                        },
        
                        {
                    
                            name: "select_manager",
                            type: "list",
                            message: "Edit employee manager",

                            choices: function() {
                                
                                managers = [];
                    
                                for(i = 0; i < employeeList.length; i++) {
                                
                                    const mId = i + 1;

                                    if(answer.select_employee.split(": ")[1] !== employeeList[i].first_name + " " + employeeList[i].last_name) {
            
                                        managers.push(mId + ": " + employeeList[i].first_name + " " + employeeList[i].last_name);

                                    };
                                    
                                };
                                
                                managers.unshift("0: None");

                                managers.unshift("E: Exit");

                                return managers;
                    
                            },

                            when: function( answers ) {
                                
                                return answers.select_role !== "0: Exit";
                            
                            }
                            
                        }
                    
                    ];

                    inquirer.prompt(empPropPrompt)
                    .then(function(answer) {

                        if(answer.select_role == "0: Exit" || answer.select_manager == "E: Exit") {

                            cli_prompt();

                        }else{

                            console.log(answer);

                            let query = "UPDATE employees SET ? WHERE employees.id = " + empSelect;
            
                            connection.query(query,
                            {
                                
                                role_id: parseInt(answer.select_role.split(":")[0]),
            
                                manager_id: parseInt(answer.select_manager.split(":")[0])
            
                            },
                            function(err, res){
            
                                if (err) throw err;
                            
                            });
            
                            let addagainPrompt = [
            
                                {
                            
                                    name: "again",
                                    type: "list",
                                    message: "Would you like to add another employee?",
                                    choices: ["Yes","Exit"]
                                
                                }
            
                            ];
            
                            inquirer.prompt(addagainPrompt)
                            .then(function(answer) {
            
                                let query =

                                    "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name, employees.manager_id " +
                                    "FROM employees " +
                                    "JOIN roles ON roles.id = employees.role_id " +
                                    "JOIN department ON roles.department_id = department.id " +
                                    "ORDER BY employees.id;"

                                ;

                                connection.query(query, function(err,res) {
                        
                                    if (err) throw err;
            
                                    if(answer.again == "Yes") {
            
                                        updateEmployee();
                                    
                                    }else if(answer.again == "Exit") {
                                        
                                        for(i = 0; i < res.length; i++) {

                                            if(res[i].manager_id == 0) {
                                                
                                                res[i].manager = "None" 
                                            
                                            }else{

                                                res[i].manager = res[res[i].manager_id - 1].first_name + " " + res[res[i].manager_id - 1].last_name;

                                            };

                                            delete res[i].manager_id;

                                        };

                                        console.table(res);
            
                                        cli_prompt(); 
            
                                    };  
            
                                });
            
                            }); 
                            
                        };

                    });    

                };

            });

        })

    })
    
};

function deleteEmployee() {

    let query = "SELECT employees.id, employees.first_name, employees.last_name FROM employees;";

    connection.query(query, function(err, res){

        if (err) throw err;

        for(i = 0; i < res.length; i++) {

            res[i].employee = res[i].first_name + " " + res[i].last_name;

            delete res[i].first_name;

            delete res[i].last_name;

        };

        console.table(res);

        let employeeList = res;

        let addEmpPrompt = [

            {
        
                name: "select_employee",
                type: "list",
                message: "Terminate employee",
                
                choices: function() {
                    
                    employees = [];
        
                    for(i = 0; i < employeeList.length; i++) {

                        employees.push(employeeList[i].id + ": " + employeeList[i].employee);
                        
                    };
                    
                    employees.unshift("0: Exit");

                    return employees;
        
                }
                
            },

            {
                
                name: "confirm",
                type: "list",

                message: function(answers) {
                        
                    return "Are you sure you want to TERMINATE " + answers.select_employee.split(": ")[1];
                
                },
                
                choices: ["Yes","No"],

                when: function( answers ) {
                    
                    return answers.select_employee !== "0: Exit";
                
                }
                
            }

        ];

        inquirer.prompt(addEmpPrompt)
        .then(function(answer) {

            if(answer.select_employee == "0: Exit") {

                cli_prompt();
            
            }else if(answer.confirm == "No") {

                deleteEmployee();

            }else{

                let query = "DELETE FROM employees WHERE employees.id =" + answer.select_employee.split(": ")[0];

                connection.query(query, function(err, res) {

                    if (err) throw err;
                
                });

                let addagainPrompt = [

                    {
                
                        name: "again",
                        type: "list",
                        message: "Would you like to remove another employee?",
                        choices: ["Yes","Exit"]
                    
                    }

                ];

                inquirer.prompt(addagainPrompt)
                .then(function(answer) {

                    let query = "SELECT employees.id, employees.first_name, employees.last_name FROM employees;";

                    connection.query(query, function(err, res){

                        if (err) throw err;

                        for(i = 0; i < res.length; i++) {

                            res[i].employee = res[i].first_name + " " + res[i].last_name;

                            delete res[i].first_name;

                            delete res[i].last_name;

                        };

                        if(answer.again == "Yes") {

                            deleteEmployee();
                        
                        }else if(answer.again == "Exit") {
                            
                            
                            console.table(res);

                            cli_prompt(); 

                        };

                    });

                });

            };

        });

    });
    
};

function exit() {

    connection.end()

    console.log("Have a good one!");

};

