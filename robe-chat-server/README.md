# Robe-Chat-Server


### Run/Debug Configurations

[Creating and Editing Run/Debug Configurations](https://www.jetbrains.com/help/idea/2016.3/creating-and-editing-run-debug-configurations.html#d2239301e379)

#### 1. Main Class

```
 io.robe.chat.ChatApplication
```

#### 2. Program Arguments

```
 server robe.yml (update table)
```

#### 3. Working Directory

```
 ../robe-examples/robe-chat-server
```

### Database

You can make the corresponding change in the `.yml` file for the database configuration as follows.

```
hibernate:
   ...
   database:
     # the name of your JDBC driver
     driverClass:  com.mysql.jdbc.Driver
     # the username
     user: root
     # the password
     password:
     # the JDBC URL
     url: jdbc:mysql://localhost:3306/robe-chat?autoReconnect=true&useSSL=false
     # Properties
     properties:
       charSet: UTF-8
       dialect: org.hibernate.dialect.MySQL5InnoDBDialect
       hibernate.hbm2ddl.auto: update
```