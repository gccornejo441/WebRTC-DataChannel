package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.GET("/", func(c *gin.Context) {
		c.File("C:/Users/gabriel.cornejo/source/repos/VSCodeApps/Golang/WebAPI-DataChannel/src/main.html")
	})

	router.Static("/static", "C:/Users/gabriel.cornejo/source/repos/VSCodeApps/Golang/WebAPI-DataChannel/src/")

	router.Run(":8085") // Listen and serve on localhost:8080
}
