package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
		router.GET("/", func(c *gin.Context) {
		c.File("C:/Users/gabriel.cornejo/source/repos/VSCodeApps/Golang/P2P/main.html")
	})

	router.Static("/static", "C:/Users/gabriel.cornejo/source/repos/VSCodeApps/Golang/P2P")

	router.Run(":8080") // Listen and serve on localhost:8080
}
