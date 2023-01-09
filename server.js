const mysql = require("mysql");
const inquirer = require("inquirer");
const { allowedNodeEnvironmentFlags, exit } = require("process");
const { isBuffer } = require("util");

const connection = mysql.createConnection({
    host: "localhost",
    post: process.env.PORT || 3001,
    user: "root",
    password: "password",
    database: "employee_db"
});

connection.connect(function(err){
    if(err) throw err;
    cli_prompt()
});

const mainPrompt = [

    {
        name: "action",
        type: "list",
        message: "Select an action",
        choices: [
            "View employees",
            "View Roles",
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
        }else if (answer.action == "Add employees") {
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
    let query = "SELECT roles.title, roles.salary, department.dept_name AS department FROM roles INNER JOIN department.id = roles.department_id;";

    connection.query(query, function(err, res) {
        
        if(err) throw err;

        console.table(res);

        cli_prompt()
    });
};

function addEmployee() {
    let query = "SELECT title FROM roles";

    let query2 =
    `SELECT employee.first_name, employees.last_name, roles.title, roles.salary, department.dept_name, employees.manager_id FROM employees JOIN roles ON roles.id = employees.role_id JOIN department ON roles.department_id = department.id ORDER BY employees.id;`
    ;

    connection.query(query, function(err, res){
        if(err) throw err;

        let rolesList = res;

        connection.query(query2, function(err, res){
            if(err) throw err;

            for(i = 0; i < res.length; i++){
                if(res[i].manager_id == 0){
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
                        manager_id: parseInt(answer.select_manager.split(":"[0]))
                    },
                    function(err, res){
                        if(err) throw err
                    })
                    let addagainPrompt = [
                        {
                            name: "again",
                            type: "list",
                            message: "Would you like to add another employee?",
                            choices: ["Yes", "Exit"]
                        }
                    ];

                    inquirer.prompt(addagainPrompt)
                    .then(function(answer){
                        let query = 
                        `SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name, employees.manager_id FROM employees JOIN roles ON roles.id = employees.roles_id JOIN department ON roles.department_id = department.id ORDER BY employess.id;`

                        ;

                        connection.query(query, function(err, res){
                            if(err) throw err;
                            if(answer.again == "Yes"){
                                addEmployee();
                            }else if(answer.again == "Exit"){
                                for(i = 0; i < res.length; i++ ){
                                    if(res[i].manager_id == 0){
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

function addDept(){
    //Continue from here, line 493
}
