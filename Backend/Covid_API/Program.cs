using Covid_API.Models;
using Microsoft.AspNetCore.OData;
using Microsoft.OData.ModelBuilder;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
var builder = WebApplication.CreateBuilder(args);
var ODataConventionModel = new ODataConventionModelBuilder();
ODataConventionModel.EntitySet<Case>("Cases");
ODataConventionModel.EntitySet<Region>("Regions");
var edmModel = ODataConventionModel.GetEdmModel();

// CORS: Cho phép mọi origin (hoặc chỉnh sửa cho domain frontend)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<Covid_API.Models.PRN232Context>();

builder.Services.AddControllers().AddOData(
    options => options.Select().Filter().OrderBy().Expand().Count().SetMaxTop(100).AddRouteComponents(
        "odata",
        edmModel));
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ODataASPNetCoreDemo", Version = "v1" });
});
var app = builder.Build();

// Configure the HTTP request pipeline.

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ODataASPNetCoreDemo v1");
        c.RoutePrefix = string.Empty; // Truy cập swagger tại đường dẫn gốc
    });
}


app.UseCors();
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
